import { IUser } from "@psni/models";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useUsersList(date?: string) {
  const {data=[], error} = useSWR<Array<IUser>>(`/api/users/?${date?('date='+date):''}`, fetcher);

  let uerror = error;
  if (error && error.response) {
    uerror = { message: error.response.data };
  }
  return {
    users: data,
    isLoading: !error && !data,
    error: uerror
  };
}
