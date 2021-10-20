/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Alert, Button, Chip, CircularProgress, Dialog,
  DialogActions, DialogContent,
  DialogContentText, DialogTitle,
  LinearProgress,
  Stack,
  TextField } from "@mui/material";

import {format} from 'date-fns';
import axios from 'axios';

function UploadUsers(){
  const [state, setState] = useState({open: false, isBusy: false, error:'', progress:0, pmsg:''});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedFiles, setSelectedFiles] = useState<any>([]);
  const [dateValue, setDateValue] = useState<string>(format(new Date(),'yyyy-MM-dd'));
  const handleClose = ()=>{
    if (!state.isBusy){
      setSelectedFiles([]);
      setState({...state, open:false, isBusy: false, error:''});
    }
  }

  const openDialog = () => { setState({...state, open:true});}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSelectFile = (e: any)=>{
    setSelectedFiles([...e.target.files])
  }

  const handleDateChange = (e:React.ChangeEvent<HTMLInputElement>)=>{ setDateValue(e.target.value); }

  const uploadSelectedFiles = async ()=>{
    try {
      setState({...state, isBusy:true, error:'', progress:0, pmsg:''});
      console.log(`uploading files`);
      // Create a form and append image with additional fields
      const form = new FormData();
      form.append('usersdata', selectedFiles[0]);
      const response = await axios.post(`/api/users/upload?date=${dateValue}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress:(event)=>{
          setState({...state,
            progress: Math.round((100 * event.loaded) / event.total),
          });
        }
      });

      if (response.status!==200) {
        setState({...state, error:'Unable to upload', isBusy:false});
        return;
      }

      const data = response.data;
      if (data.jobid){
        const checkjob = setInterval(()=>{
          axios.get(`/api/job/${data.jobid}`)
            .then(res=>res.data)
            .then(jobstatus=>{
              if (jobstatus.status==='done'){
                clearInterval(checkjob);
                handleClose();
              } else {
                setState({...state, progress:(jobstatus.completed*100.0/jobstatus.total), pmsg:`${jobstatus.completed} of ${jobstatus.total}`});
              }
            })
            .catch(err=>{
              console.error(err);
              clearInterval(checkjob);
              setState({...state, error:'Unable to find the upload status', isBusy:false});
            })
        }, 1000);
      } else {
        handleClose();
      }
    } catch (err:any) {
      console.error(err);
      if (err.response) {
        if (err.response.status===400) {
          setState({...state, error:err.response.data.error, isBusy:false});
          return;
        }
        setState({...state, error:'Unable to find the upload status. '+err.message, isBusy:false});
      }
    }
    // setTimeout(()=>{
    //   setState({...state, open:false, isBusy: false, error:''});
    // }, 3000);
  }

  return (<>
    <Button color="primary" variant="contained" onClick={openDialog}>Upload</Button>
    <Dialog open={state.open} onClose={handleClose} aria-labelledby="upload-form-dialog-title">
      <DialogTitle id="upload-form-dialog-title">Upload excel file</DialogTitle>
      <DialogContent >
        <DialogContentText >
          {state.pmsg}
        </DialogContentText>
        {state.isBusy?<LinearProgress value={state.progress} />:(
          state.error!==''?<Alert color='error'>{state.error}</Alert>:null)}
        {selectedFiles.length > 0 ? (
          <Stack direction="column" spacing={2}>
            {selectedFiles.map((f:any)=><Chip key={f.name} color={"primary"}
            variant="outlined" label={f.name}/>)}
            <TextField type="date"
              id="date"
              label="Snapshot Date"

              value={dateValue}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
          ) : (
          <label htmlFor="btn-upload">
          <input
            id="btn-upload"
            name="btn-upload"
            style={{ display: 'none' }}
            type="file"
            onChange={onSelectFile} />
          <Button fullWidth
            className="btn-choose"
            variant="outlined"
            component="span" >
            Choose Files
          </Button>
        </label> )}
      </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button color="primary" variant="contained"
            disabled={selectedFiles.length<1 || state.isBusy}
            onClick={uploadSelectedFiles}>
            {state.isBusy?<CircularProgress size="1em"/> :'Upload'}
          </Button>
        </DialogActions>
    </Dialog>
  </>
  )
}

export default UploadUsers;
