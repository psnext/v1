
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
  current_region?:string
  home_region?:string
  primary_skill?:string
  team?: string
  title?: string
}


export class EventDataMap extends Map<string, Array<IEventData>> {};
export interface IUser {
  id: string
  email: string
  name?: string
  picture?: string
  details: IUserDetails,
  data?:EventDataMap
}

export interface IEventData {
  timestamp:Date,
  key:string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details:any
}
