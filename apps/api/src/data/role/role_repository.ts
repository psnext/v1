
import Permission from '../permission/permission';
import Role from './role';

export default interface IRoleRepository {
  create(name:string):Promise<Role>;
  update(role:Role): Promise<Role>;

  getPermissions(role:Role):Promise<ReadonlyArray<Permission>>; 
  findById(id:string): Promise<Role|null>;
  findByName(namepart:string): Promise<ReadonlyArray<Role>>;
}