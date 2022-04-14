import { Box, Typography } from "@mui/material";

interface TabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
  fullHeight?:boolean;
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index,fullHeight, ...other } = props;

  return (
    <div style={{position: 'relative', height:fullHeight?'100%':'auto', width:'100%', display:'flex', flexDirection:'column', overflow:'scroll'}}
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}
