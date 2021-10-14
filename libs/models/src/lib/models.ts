
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
  name: string
  email?: string
  picture?: string
  details: IUserDetails
}
