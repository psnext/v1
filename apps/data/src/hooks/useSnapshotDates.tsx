import useSWR from "swr";
import { fetcher } from "./fetcher";
import * as fns from 'date-fns';

export function useSnapshotDates() {
  const {data=[], error} = useSWR<Array<{snapshotdate:string, count:number}>>(`/api/users/snapshotdates`, fetcher);

  let uerror = error;
  if (error && error.response) {
    uerror = { message: error.response.data };
  }
  return {
    data,
    isLoading: !error && !data,
    error: uerror
  };
}
