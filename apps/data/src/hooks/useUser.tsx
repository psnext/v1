import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useUser(id: string) {
  const { data, error } = useSWR(`/api/users/${id}`, fetcher);

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
