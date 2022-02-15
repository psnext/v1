import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface IconMenuProps {
  //children: React.ReactNode;
  options:Array<string>;
  selectedOption?: string;
  itemHeight?:number;
  onClick?:(option:string)=>void;
}

export function IconMenu(props: IconMenuProps) {
  const { itemHeight=48, options, selectedOption } = props;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionClick = (option:string) => {
    if (props.onClick) {
      props.onClick(option);
    }
    handleClose();
  }

  return (
    <div>
      <IconButton
        aria-label="more"
        id="icon-menu-button"
        aria-controls={open ? 'more-menuitems' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="more-menuitems"
        MenuListProps={{
          'aria-labelledby': 'more-menuitems',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: itemHeight * 4.5,
            width: '20ch',
          },
        }}
      >
        {options.map((option) => (
          option!==''?<MenuItem key={option} selected={option === selectedOption} onClick={(e)=>handleOptionClick(option)}>
            {option}
          </MenuItem>:null
        ))}
      </Menu>
    </div>
  );
}
