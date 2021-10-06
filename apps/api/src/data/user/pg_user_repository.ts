import IUserRepository from "./user_repository";
import { Pool } from 'pg';
import User from "./user";
import { DataError, ForbiddenDataError, ICache, IContext } from "../common";
import Role from "../role/role";
import Permission from "../permission/permission";

export default class PG_User_Repository implements IUserRepository {

  readonly #pool:Pool;
  readonly #cache?:ICache;
  readonly #context:IContext;

  constructor(connectionStringOrPool:string|Pool , options?:{cache?:ICache, context?:IContext}) {
    if (typeof connectionStringOrPool === 'string') {
      this.#pool = new Pool({
        connectionString: connectionStringOrPool,
      });
    } else {
      this.#pool = connectionStringOrPool;
    }
    if (options) {
      this.#cache = options.cache;
      this.#context = options.context;
    }
  }
  async create(email: string): Promise<User> {
    const res = await this.#pool.query('INSERT INTO users(email) VALUES($1) RETURNING id, email', [email.toLocaleLowerCase()]);
    const data = res.rows[0];
    return new User(data);
  }

  async update(user: User): Promise<User|null> {
    const requiredPermissions = ['Users.Write.All', 'Users.Write.Self'];
    try {
      const hasPermissions = await this.#hasPermissions(user.id, requiredPermissions);
      if (!hasPermissions){
        throw new ForbiddenDataError(`updating user(${user.id})`, requiredPermissions);
      }

      const vals=[user.id];
      const q:string[]=[];
      Object.keys(user.changes).forEach((k,i) => {
        q.push(`${k}=$${i+2}`);
        vals.push(user.changes[k]);
      });
      if (q.length===0) return user;
      const qstr = `UPDATE users SET ${q.join(',')} WHERE id=$1 RETURNING id, email, name, picture, details`;
      // console.debug(qstr);
      const res = await this.#pool.query(qstr, vals);
      if (res.rowCount===0) return null;
      const data = res.rows[0];
      user.name = data.name;
      user.email = data.email;
      user.picture = data.picture;
      user.details = data.details;
      return user;
    } catch (ex) {
      if (ex instanceof DataError) throw ex;
      console.debug(ex);
      throw new DataError(500, `Unable to update user(${user.id})`, ex);
    }
  }

  async addRoles(user:User, roles:Role[]): Promise<boolean> {
    const requiredPermissions = ['UserRoles.Write.All','UserRoles.Write.Self'];
    try{
      const hasPermissions = await this.#hasPermissions(user.id, requiredPermissions);
      if (!hasPermissions) {
        throw new ForbiddenDataError(`adding roles to user(${user.id})`, requiredPermissions);
      }
      for await (const role of roles) {
        await this.#pool.query(`INSERT INTO user_roles(uid, roleid) VALUES($1, $2)`,[user.id, role.id]);
      };
      if (this.#cache) {
        this.#cache.del(`perms.${user.id}`);
      }
      return true;
    } catch (ex) {
      console.debug(ex);
      throw new DataError(500, `Unable to update user(${user.id})`, ex);
    }
  }

  async removeRoles(user:User, roles:Role[]): Promise<boolean> {
    const requiredPermissions = ['UserRoles.Write.All', 'UserRoles.Write.Self'];
    try{
      const hasPermissions = await this.#hasPermissions(user.id, requiredPermissions);
      if (!hasPermissions) {
        throw new ForbiddenDataError(`removing roles from user(${user.id})`, requiredPermissions);
      }
      for await (const role of roles) {
        await this.#pool.query(`DELETE FROM user_roles WHERE uid=$1 AND roleid=$2`, [user.id, role.id]);
      };
      if (this.#cache) {
        this.#cache.del(`perms.${user.id}`);
      }
      return true;
    } catch (ex) {
      console.debug(ex);
      throw new DataError(500, `Unable to update user(${user.id})`, ex);
    }
  }

  async getPermissions(uid?:string): Promise<Permission[]> {
    const permissions:Permission[]=[];
    if (!uid) return permissions;
    const CACHE_KEY = `perms.${uid}`;
    try {
      if (this.#cache) {
        const cdata:[] = await this.#cache.get(CACHE_KEY);
        if (cdata) {
          cdata.map((p)=>{
            permissions.push(new Permission(p));
          })
          return permissions;
        }
      }

      let res = await this.#pool.query(`SELECT * FROM permissions WHERE id in
        (SELECT permissionid AS id FROM role_permissions WHERE roleid IN
          (SELECT id FROM roles WHERE id IN
            (SELECT roleid AS id FROM user_roles WHERE uid=$1)
          )
        )`,
       [uid]);
      res.rows.map((p)=>{
        permissions.push(new Permission(p));
      });


      //get custom permissions
      res = await this.#pool.query(`SELECT p.* FROM permissions as p
        INNER JOIN users_custom_permissions as ucp
        ON (ucp.permission=p.name) where ucp.uid=$1;`,
       [uid]);
      res.rows.map((p)=>{
        permissions.push(new Permission(p));
      });
      if (this.#cache) {
        this.#cache.set(CACHE_KEY, permissions.map(p=>p.toJSON()))
      }
    } catch(ex) {
      console.debug(ex);
      return null;
    }
    return permissions;
  }

  async #hasPermissions(dataOwnerId:string, requiredPermissions:string[]):Promise<boolean> {
    try {
      const userPermissions = await this.getPermissions(this.#context?.user.id);
      for(let i=0;i<userPermissions.length;i++) {
        if (requiredPermissions.indexOf(userPermissions[i].name)!==-1) {
          if (userPermissions[i].name.endsWith('.Self')) {
            if (this.#context?.user.id===dataOwnerId) {
              return true;
            }
          } else {
            return true;
          }
        }
      }
    } catch (ex) {
      console.debug(ex);
    }
    return false
  }

  async getRoles(user:User): Promise<readonly Role[]> {
    const requiredPermissions = ['UserRoles.Read.All','UserRoles.Read.Self'];
    const roles:Role[]=[];

    try{
      const hasPermissions = await this.#hasPermissions(user.id, requiredPermissions);
      if (!hasPermissions) {
        throw new ForbiddenDataError(`reading roles of user(${user.id})`, requiredPermissions);
      }

      const res = await this.#pool.query('SELECT * FROM roles WHERE id IN (SELECT roleid AS id FROM user_roles WHERE uid=$1)', [user.id]);
      res.rows.map((r)=>{
        roles.push(new Role(r));
      });
      return roles;
    } catch(ex) {
      if (ex instanceof DataError) throw ex;
      console.debug(ex);
      throw new DataError(500,`Unable to getRoles for user(${user.id})`,ex);
    }
  }

  async findById(id: string): Promise<User|null> {
    // const requiredPermissions = ['Users.Read.All', this.#context?.user.id===id?'Users.Read.Self':''];
    // const hasPermissions = await this.#hasPermissions(this.#context?.user.id, requiredPermissions);
    // if (!hasPermissions) {
    //   throw new ForbiddenDataError(`reading roles of user(${id})`, requiredPermissions);
    // }
    try {
      if (this.#cache) {
        const userdata = await this.#cache.get(`user.${id}`);
        if (userdata) {
          return new User(userdata);
        }
      }

      const res = await this.#pool.query(`SELECT id, name, email, picture, details from users WHERE id=$1`, [id]);
      if (res.rowCount <=0) return null;
      const data = res.rows[0];
      const usr = new User(data);
      if (this.#cache) {
        this.#cache.set(`user.${usr.id}`, data)
      }
      return usr;
    } catch (ex) {
      throw new DataError(500, `Unable to Find user by Id(${id}) ${ex.message||''}`, ex);
    }
  }

  async findByEmail(emailpart: string, limit?:number, offset?:number): Promise<readonly User[]> {
    offset=Math.ceil(offset||0);
    limit=Math.ceil(limit||50);
    const res = await this.#pool.query('SELECT id, name, email, picture from users WHERE lower(email) LIKE $1 ORDER BY email LIMIT $2 OFFSET $3',
      [`%${emailpart.toLocaleLowerCase()}%`, limit, offset]);
    const users:Array<User> = res.rows.map(data=>new User(data));
    return users;
  }

  /**
   * Get a set of users by searching by name.
   * @param namepart subset of the name to match
   * @param limit maximum number of results to return (default 50)
   * @param offset starting row of the results (default 0)
   * @returns array of users who name contains a `namepart` , the results are sorted by name
   */
  async findByName(namepart: string, limit?:number, offset?:number): Promise<readonly User[]> {
    offset=Math.ceil(offset||0);
    limit=Math.ceil(limit||50);
    const res = await this.#pool.query('SELECT id, name, email, picture from users WHERE lower(name) LIKE $1 ORDER BY name LIMIT $2 OFFSET $3',
      [`%${namepart.toLocaleLowerCase()}%`, limit, offset]);
    const users:Array<User> = res.rows.map(data=>new User(data));
    return users;
  }
}
