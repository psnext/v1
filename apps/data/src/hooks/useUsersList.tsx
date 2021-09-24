import axios from "axios";
import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useUsersList(date?: string) {
  const {data=[], error} = useSWR(`/api/users/${date?('date='+date):''}`, fetcher);

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
