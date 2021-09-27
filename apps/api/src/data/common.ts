import User from "./user/user";


export interface IModel {
  toJSON(): any;
  toString(): string;
}

export interface ICache {
  get(key:string): Promise<any>;
  set(key:string, value:any, options?:any): Promise<any>;
  del(key:string): Promise<any>;
}

export interface IContext {
  get user() : User;
}

export interface IQueryResult<T> {
  get totalCount(): number;
  get results(): ReadonlyArray<T>
}

export interface IDataError {
  get message(): string;
  get code(): number;
  get exception(): any;
}

export class DataError implements IDataError {

  #message: string;
  #code:number;
  #exception:any;

  constructor(code:number, message:string, exception?:any) {
    this.#message = message;
    this.#code = code;
    this.#exception = exception;
  }

  get message(): string {
    return this.#message;
  }
  get code(): number {
    return this.#code;
  }

  get exception(): any {
    return this.#exception;
  }
}

export class ForbiddenDataError extends DataError {
  #missingPermissions:string[];
  constructor(action:string, missingPermissions:string[]) {
    super(403, `Missing ${missingPermissions.join(',')}, needed for ${action}}`);
    this.#missingPermissions = missingPermissions;
  }

  get MissingPermissions():string[] {
    return this.#missingPermissions;
  }
}
