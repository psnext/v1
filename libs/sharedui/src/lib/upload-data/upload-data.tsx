/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, Button, Dialog, DialogContent, DialogContentText, DialogTitle, FormControl,
  InputLabel, LinearProgress, MenuItem, Paper, Select, SelectChangeEvent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import * as Excel from 'exceljs';
import * as fns from 'date-fns';
import { EventDataMap, IEventData } from "@psni/models";
import { time, timeEvent, TimeSeries } from "pondjs"
import Immutable from "immutable";


interface PreviewTableProps {
  data: Map<string, Map<string, Array<IEventData>>>,
  display_type: string
}
function PreviewTable(props:PreviewTableProps) {
  const users:Array<any> = [];
  for (const [email, eventmap] of props.data.entries()) {
    for(const [key, eventdata] of eventmap.entries()) {
      const events = eventdata.map((ed)=>{
        return timeEvent(time(ed.timestamp), Immutable.Map(ed.details));
      });
      users.push({
        email,
        key,
        events:eventdata,
        timeseries:new TimeSeries({
          name:key,
          events: Immutable.List(events)
        })
      })
    }
  }
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell >Email</TableCell>
            <TableCell align="center">Key</TableCell>
            <TableCell align="center">Count</TableCell>
            <TableCell align="center">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.slice(0,10).map((row:any, i:number) => (
            <TableRow
              key={i}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.email.substr(0,10)}...
              </TableCell>
              <TableCell align="center">{row.key}</TableCell>
              <TableCell align="center">{row.timeseries.count()}</TableCell>
              <TableCell align="center">{
              props.display_type==='join'?row.events.map((e:IEventData)=>e.details.VALUE).join(', '):
              props.display_type==='count'?row.events.length:
              props.display_type==='last'?row.timeseries.atLast().get('VALUE'):
              props.display_type==='first'?row.timeseries.atFirst().get('VALUE'):
              row.timeseries.toString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/* eslint-disable-next-line */
export interface UploadDataProps {
  OnData?: (data:Map<string, EventDataMap>)=>any;
}

interface UploadDataState {
  open: boolean;
  isBusy: boolean;
  error:string;
  progress:number;
  message:string;
  display_type:string,
  data:Map<string, EventDataMap>
}

export function UploadData(props: UploadDataProps) {
  const [state, setState] = useState<UploadDataState>({open: false, isBusy: false, error:'', progress:0, message:'',
    data:new Map<string, EventDataMap>(), display_type:'join'});
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
      headers.EVENTTYPE  = hdr.indexOf('EVENTTYPE');
      headers.EVENT_VALUE = hdr.indexOf('EVENT_VALUE');

      if (headers.EMAIL===-1) { return setError("Missing 'EMAIL' column");}
      if (headers.TIMESTAMP===-1) { return setError("Missing 'TIMESTAMP' column");}
      if (headers.EVENTTYPE===-1) { return setError("Missing 'EVENTTYPE' column");}
      if (headers.EVENT_VALUE===-1) { return setError("Missing 'EVENT_VALUE' column");}
      const data = new Map<string, EventDataMap>();
      //const date0 = new Date(0);
      //const utcOffset = date0.getTimezoneOffset();
      for(let i=2;i<=worksheet.rowCount;++i) {
        const row = worksheet.getRow(i);

        const email = row.getCell(headers.EMAIL).value?.toString().toLocaleLowerCase().trim()||'';
        if (email==='') continue;
        const key=row.getCell(headers.EVENTTYPE).value?.toString().trim()||'';
        if (key==='') continue;
        if (row.getCell(headers.TIMESTAMP).type!==Excel.ValueType.Date) {
          setError(`TIMESTAMP column should contain data of type 'Date' (YYYY-MM-DD[T]HH:mm:ss or YYYY-MM-DD)`)
          return;
        }
        const timestamp:Date=row.getCell(headers.TIMESTAMP).value as Date;
        if (!timestamp) continue;
        //const timestamp = new Date(0, 0, tscell - 1, 0, -utcOffset, 0);

        const details:any={};
        hdr.forEach((h:any,i:number)=>{
          const parts=h.toString().split('_');
          if (parts.length<2 || parts[0]!=='EVENT') return;
          details[parts[1]]=row.getCell(i).value;
        });

        let userdata = data.get(email);
        if (!userdata) {
          userdata = new EventDataMap();
          data.set(email, userdata);
        }
        let eventdata = userdata.get(key);
        if (!eventdata) {
          eventdata = new Array<IEventData>();
          userdata.set(key, eventdata)
        }
        eventdata.push({
          timestamp, key, details,
        })
        setState({...state, progress:i/worksheet.rowCount});
      }
      console.log(`${selectedFiles[0].name} 'data' contains: ${worksheet.rowCount} rows`);
      setState({...state, isBusy:false, message: `Finished reading ${worksheet.rowCount} rows`, progress:1, data})
    };
    reader.onerror=(err)=>{
      setError(err.target?.result);
    }
  }, [selectedFiles]);

  const handleClose = ()=>{
    if (!state.isBusy){
      setSelectedFiles(undefined);
      setState({...state, open:false, isBusy: false, error:'', message:'', progress:0});
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSelectFile = (e:any)=>{
    setSelectedFiles(e.target.files)
  }

  const handleDataTypeChange = (event: SelectChangeEvent) => {
    setState({...state, display_type:(event.target.value as string)});
  };

  const handleUpload = ()=>{
    if (state.progress===1) {
      if (props.OnData) {
        props.OnData(state.data);
      }
      setSelectedFiles(undefined);
      setState({...state, open:false, isBusy: false, error:'', message:'', progress:0,
        data:new Map<string, EventDataMap>()});
    }
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
        {state.progress===0?<label htmlFor="btn-upload">
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
        </label>:<div>
          <FormControl fullWidth sx={{my:1}}>
            <InputLabel id="upload-select-dtype-label">Display Type</InputLabel>
            <Select
              labelId="upload-select-dtype-label"
              id="upload-select-dtype"
              value={state.display_type}
              label="Display Type"
              onChange={handleDataTypeChange}
            >
              <MenuItem value={'join'}>Join</MenuItem>
              <MenuItem value={'count'}>Count</MenuItem>
              <MenuItem value={'first'}>First</MenuItem>
              <MenuItem value={'last'}>Last</MenuItem>
              <MenuItem value={'avg'}>Avg</MenuItem>
              <MenuItem value={'sum'}>Sum</MenuItem>
            </Select>
          </FormControl>
          <p>First 10 rows preview...</p>
          <PreviewTable data={state.data} display_type={state.display_type}/>
          <Button fullWidth sx={{my:1}}
            variant="outlined" onClick={handleUpload}>
            Upload Data
          </Button>
        </div>}
      </DialogContent>
    </Dialog>
  </>
  );
}

export default UploadData;
