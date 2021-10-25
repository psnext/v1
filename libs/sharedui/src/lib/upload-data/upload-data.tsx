/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, Button, Dialog, DialogContent, DialogContentText, DialogTitle, LinearProgress } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import * as Excel from 'exceljs';
import * as fns from 'date-fns';
import { IUserCustomData } from "@psni/models";

/* eslint-disable-next-line */
export interface UploadDataProps {
  OnData?: (data:Array<IUserCustomData>)=>any;
}

export function UploadData(props: UploadDataProps) {
  const [state, setState] = useState({open: false, isBusy: false, error:'', progress:0, message:''});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedFiles, setSelectedFiles] = useState<FileList>();

  const setError = useCallback((errorMessage)=>{
    setState({...state, error: errorMessage});
  },[state, setState]);

  const setMessage = useCallback((message)=>{
    setState({...state, message});
  },[state, setState]);

  useEffect(()=>{
    if (!selectedFiles) return;
    setState({...state, error:'', message:`Reading file:${selectedFiles[0].name}`, isBusy:true, progress:0});
    const reader=new FileReader();

    reader.readAsArrayBuffer(selectedFiles[0]);
    reader.onload=async (ev)=>{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filedata:any = ev.target?.result;
      if (!filedata) {
        setError(`Unable to read the file;${selectedFiles[0].name}.`)
        return;
      }
      // load from buffer
      const workbook = new Excel.Workbook();
      await workbook.xlsx.load(filedata);
      const worksheet = workbook.getWorksheet('data');
      if (!worksheet) {
        console.error(`File does NOT contain 'data' worksheets`);
        setError(`File(${selectedFiles[0].name}) does NOT contain 'data' worksheet`);
        return;
      }
      const headerRow = worksheet.getRow(1);
      if (!headerRow) {
        const error=`${selectedFiles[0].name} 'data' does not contain header row`;
        console.error(error);
        setError(error);
        return;
      }
      console.log(`Data elements: ${headerRow.values}`);
      const hdr:any = headerRow.values;
      const headers:any = {};
      headers.EMAIL      = hdr.indexOf('EMAIL');
      headers.TIMESTAMP  = hdr.indexOf('TIMESTAMP');
      headers.DATA_TYPE  = hdr.indexOf('DATA_TYPE');
      headers.DETAILS_VALUE = hdr.indexOf('DETAILS_VALUE');

      if (headers.EMAIL===-1) { return setError("Missing 'EMAIL' column");}
      if (headers.TIMESTAMP===-1) { return setError("Missing 'TIMESTAMP' column");}
      if (headers.DATA_TYPE===-1) { return setError("Missing 'DATA_TYPE' column");}
      if (headers.DETAILS_VALUE===-1) { return setError("Missing 'DETAILS_VALUE' column");}
      const data:Array<any> =[]
      for(let i=2;i<=worksheet.rowCount;++i) {
        const row = worksheet.getRow(i);
        const details:any={};
        hdr.forEach((h:any,i:number)=>{
          const parts=h.toString().split('_');
          if (parts.length<2 || parts[0]!=='DETAILS') return;
          details[parts[1]]=row.getCell(i).value;
        });
        const timestamp=row.getCell(headers.TIMESTAMP);
        if (timestamp.type!==Excel.ValueType.Date) {
          setError(`TIMESTAMP column should contain data of type 'Date' (YYYY-MM-DD[T]HH:mm:ss or YYYY-MM-DD)`)
          return;
        }
        data.push({
          email: row.getCell(headers.EMAIL).value?.toString(),
          timestamp: timestamp.value,
          data_type: row.getCell(headers.DATA_TYPE).value?.toString(),
          details,
        })
        setState({...state, progress:i/worksheet.rowCount});
      }
      console.log(`${selectedFiles[0].name} 'data' contains: ${worksheet.rowCount} rows`);
      setState({...state, isBusy:false, message: `Finished reading ${worksheet.rowCount} rows`, progress:1})
      if (props.OnData) {
        props.OnData(data);
      }
    };
    reader.onerror=(err)=>{
      setError(err.target?.result);
    }
  }, [selectedFiles]);

  const handleClose = ()=>{
    if (!state.isBusy){
      setSelectedFiles(undefined);
      setState({...state, open:false, isBusy: false, error:''});
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSelectFile = (e:any)=>{
    setSelectedFiles(e.target.files)
  }

  const openDialog = () => { setState({...state, open:true});}
  return (<>
    <Button color="primary" variant="contained" onClick={openDialog}>Upload</Button>
    <Dialog open={state.open} onClose={handleClose} aria-labelledby="upload-form-dialog-title">
      <DialogTitle id="upload-form-dialog-title">Upload excel data file</DialogTitle>
      <DialogContent >
        <DialogContentText >
          {state.message}
        </DialogContentText>
        {state.isBusy?<LinearProgress value={state.progress} />:(
          state.error!==''?<Alert color='error'>{state.error}</Alert>:null)}
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
            Choose File
          </Button>
        </label>
      </DialogContent>
    </Dialog>
  </>
  );
}

export default UploadData;
