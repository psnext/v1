import IPermissionRepository from "./permission_repository";
import { Pool } from 'pg';
import Permission from "./permission";
import { ICache } from "../common";

export default class PG_Permission_Repository implements IPermissionRepository {

  #pool:Pool;
  #cache?: ICache;
  #context?: any;

  constructor(connectionStringOrPool:string|Pool, options?:{cache?:ICache, context?:any}) {
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
  async create(name: string): Promise<Permission> {
    const res = await this.#pool.query('INSERT INTO permissions(name) VALUES($1) RETURNING id, name', [name]);
    return new Permission(res.rows[0]);
  }

  async update(permission: Permission): Promise<Permission> {
    throw new Error("Method not implemented.");
  }
 
  async findById(id: string): Promise<Permission> {
    try {
      if (this.#cache) {
        const permissiondata = await this.#cache.get(`role.${id}`);
        if (permissiondata) {
          return new Permission(permissiondata);
        }
      }
      const res = await this.#pool.query('SELECT id, name, display_name, description from permissions WHERE id=$1',[id]);
      if (res.rowCount <=0) return null;
      const data = res.rows[0];
      if (this.#cache) {
        this.#cache.set(`role.${data.id}`, data)
      }
      return new Permission(data);
    } catch (ex) {
      // console.error(`error in findById(${id})`, ex);
    }
    return null;
  }

  async findByName(namepart: string): Promise<readonly Permission[]> {
    const res = await this.#pool.query('SELECT id, name, display_name, description from permissions WHERE lower(name) LIKE $1',[`%${namepart.toLocaleLowerCase()}%`]);
    const permissions:Array<Permission> = res.rows.map(data=>new Permission(data));
    return permissions;
  }
}