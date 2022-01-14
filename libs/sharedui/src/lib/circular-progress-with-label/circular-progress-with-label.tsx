/* eslint-disable-next-line */

import React from 'react';
import PropTypes from 'prop-types';
import { OverridableStringUnion } from '@mui/types';
import { Box, CircularProgress, CircularProgressPropsColorOverrides, Typography } from '@mui/material';

export interface CircularProgressWithLabelProps {
  value:number,
  label?:string,
  color?: OverridableStringUnion<
  'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit',
  CircularProgressPropsColorOverrides
>;
}

export function CircularProgressWithLabel(props:CircularProgressWithLabelProps) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="caption" component="div">{props.label||`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}
export default CircularProgressWithLabel;
