import { Box, SxProps } from '@mui/system';
import './page.module.css';

/* eslint-disable-next-line */
export interface PageProps {
  children?: React.ReactNode
  center?: boolean,
  sx?: SxProps,
}

export function Page(props: PageProps) {
  const sx = props?.sx||{};

  sx.height=sx.height||'100%';
  sx.display=sx.display||'flex';
  sx.flexDirection=sx.flexDirection||'column';
  if (props.center) {
    sx.justifyContent = 'center';
    sx.alignItems= 'center';
  }

  return (
    <Box sx={sx}>
      {props.children}
    </Box>
  );
}

export default Page;
