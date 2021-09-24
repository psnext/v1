
import Permission from './permission';

export default interface IRoleRepository {
  create(name:string):Promise<Permission>;
  update(permission:Permission): Promise<Permission>;

  findById(id:string): Promise<Permission|null>;
  findByName(namepart:string): Promise<ReadonlyArray<Permission>>;
}