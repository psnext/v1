import { IModel } from "../common";
import Role from "../role/role";

export default class User implements IModel {
  readonly #id: string;
  #email: string;
  #name: string|null;
  #picture: string|null;
  #details?: any={};
  #roles: Role[]=[];
  #changedValues:any={};

  constructor(data:{id:string, email:string, name?:string, picture?:string, details?:any, roles?:Role[]}){
    this.#id = data.id;
    this.email = data.email,
    this.name = data.name||null;
    this.picture = data.picture||null;
    this.details = data.details||{};
    this.#roles = data.roles||[];
    this.#changedValues={};
  }

  get id():string {
    return this.#id;
  }

  get email():string {
    return this.#email;
  }
  set email(email:string) {
    const newValue=email?email.toLocaleLowerCase():'';
    if (newValue!==this.#email) {
      this.#changedValues['email']=newValue;
      this.#email = email.toLocaleLowerCase();
    }
  }

  get name():string|null {
    return this.#name
  }

  set name(name:string|null) {
    if (name!==this.#name) {
      this.#changedValues['name']=name;
      this.#name = name;
    }
  }

  get picture():string|null {
    return this.#picture;
  }

  set picture(picture:string|null) {
    if (picture!==this.#picture) {
      this.#changedValues['picture']=picture;
      this.#picture = picture;
    }
  }

  get details():any {
    return this.#details;
  }
  set details(details:any) {
    const areEqual = (Object.entries(details).sort().toString()===
    Object.entries(this.#details).sort().toString())
    if (!areEqual) {
      this.#changedValues['details']=details;
      this.#details = details||{};
    }
  }

  get changes():any {
    return this.#changedValues;
  }

  get roles():ReadonlyArray<Role> {
    return this.#roles;
  }


  toJSON():object {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      picture: this.picture,
    }
  }

  toString():string {
    return `${this.id}:${this.email}`;
  }
}
