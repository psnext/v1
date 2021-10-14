import useSWR from "swr";
import { fetcher } from "./fetcher";
import { IUser } from "@psni/models";

export function useUser(id: string|undefined) {
  const { data, error } = useSWR<IUser>(`/api/users/${id||'me'}`, fetcher);

  let uerror = error;
  if (error && error.response) {
    uerror = { message: error.response.data };
  }
  return {
    user: data,
    isLoading: !error && !data,
    error: uerror
  };
}
