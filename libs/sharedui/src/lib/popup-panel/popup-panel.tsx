import { Popover, PopoverOrigin } from '@mui/material';
import { SetStateAction, useState } from 'react';
import './popup-panel.module.css';

/* eslint-disable-next-line */
export interface PopupPanelProps {
  children: React.ReactNode,
  buttonProps?: any,
  buttonContent?: React.ReactNode,
  anchorOrigin?: PopoverOrigin,
  transformOrigin?: PopoverOrigin,
}

export function PopupPanel({children,
  buttonProps,
  buttonContent,
  anchorOrigin={
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin={
    vertical: 'top',
    horizontal: 'center',
  }
}:PopupPanelProps) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event:any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'popuppanel' : undefined;

  return (
    <>
      <span {...buttonProps} aria-describedby={id}  onClick={handleClick} style={{cursor: 'pointer'}}>
        {buttonContent}
      </span>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        {children}
      </Popover>
    </>
  );
}

export default PopupPanel;
