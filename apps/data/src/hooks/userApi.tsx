/* eslint-disable @typescript-eslint/no-explicit-any */
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

export function useUserPermissions(id: string) {
  const { data, error } = useSWR<any>(`/api/users/${id}/permissions`, fetcher);

  let uerror = error;
  if (error && error.response) {
    uerror = { message: error.response.data };
  }
  return {
    permissions: data,
    isLoading: !error && !data,
    error: uerror
  };
}
