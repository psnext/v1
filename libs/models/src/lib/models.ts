
export interface IUserCustomData {
  email:string,
  timestamp:Date,
  data_type:string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details:any
}

export interface ICustomDataSummary {
  rawdata:Array<any>,
}
export interface IUserDetails {
  capability?: string
  career_stage?: string
  client?: string
  contractor?: boolean
  gender?: string
  oid?: number
  snapshotdate?: string
  startdate?: string
  supervisor_name?: string
  supervisor_oid?: number
  team?: string
  title?: string
}

export interface IUser {
  id: string
  email: string
  name?: string
  picture?: string
  details: IUserDetails,
  customdata?:Map<string, Array<any>>
}
