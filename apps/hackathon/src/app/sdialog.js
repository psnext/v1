import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function SimpleDialog({title, renderButton, children}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () =>{
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <div>
      {renderButton( {handleClick: (e)=>{handleClickOpen();} } )}
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={'paper'}
        maxWidth='md'
        aria-labelledby={title+"-dialog-title"}
        aria-describedby={title+"-dialog-description"}
      >
        <DialogTitle id={title+"-dialog-title"}>{title}</DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText
            id={title+"-dialog-description"}
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            {children}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Ok</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
