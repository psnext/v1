import Permission from '../permission/permission';
import Role from '../role/role';
import User from './user';

export default interface IUserRepository {
  create(email:string):Promise<User>;
  update(user:User): Promise<User>;

  addRoles(user:User, roles:Role[]): Promise<Boolean>;
  removeRoles(user:User, roles:Role[]): Promise<Boolean>;
  
  getRoles(user:User): Promise<ReadonlyArray<Role>>;
  getPermissions(uid:String): Promise<ReadonlyArray<Permission>>;

  findById(id:string): Promise<User|null>;
  findByEmail(emailpart:string, limit?:number, offset?:number): Promise<ReadonlyArray<User>>;
  findByName(namepart:string, limit?:number, offset?:number): Promise<ReadonlyArray<User>>;
}
