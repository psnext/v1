/* eslint-disable @typescript-eslint/no-explicit-any */

import { Box } from "@mui/material";
import { useMemo } from "react";

/* eslint-disable-next-line */
export interface SummayWidgetProps {
  data: Array<any>,
  summaryFn?:any
}

export function SummayWidget(props: SummayWidgetProps) {
  const {data, summaryFn=(d:any)=>d.length} = props;

  const value = useMemo(()=>{
    return summaryFn(data);
  },[data, summaryFn]);

  return (
    <Box>
      {value}
    </Box>
  );
}

export default SummayWidget;
