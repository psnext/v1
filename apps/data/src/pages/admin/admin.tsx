
import React, { useMemo, useState } from 'react';
import {CalendarChart, Page, useAuth, useQuery} from '@psni/sharedui';
import { Link, Redirect, useHistory } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, CardHeader, CircularProgress,
  FormControl, FormHelperText, Icon, Input, InputAdornment, InputLabel, OutlinedInput, Snackbar, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { green } from '@mui/material/colors';
import { CodeOutlined, LockOutlined } from '@mui/icons-material';

import * as fns from 'date-fns';
import UploadUsers from './upload_users';
import { useSnapshotDates } from '../../hooks/useSnapshotDates';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AdminProps {
}

export function Admin (props:AdminProps){
  const history = useHistory();
  const {user, status} = useAuth();
  const {data, isLoading} = useSnapshotDates();
  const query = useQuery();
  const [state, setState] = useState({
    email: query.get('e')||'', code:'',
    isBusy: false, isCodeVerified: false,
    openSnackBar: false, snackbarmessage: '',
  })

  const caldata = useMemo(()=>{
    const caldata:Array<{date:Date, value:number, close: number}> = [];

    if (!data || data.length===0) return caldata;

    const dlen=data.length;
    for(let i=0;i<dlen-1;i++){
      caldata.push({
        date: fns.parseISO(data[i].snapshotdate),
        close: data[i].count,
        value:(data[i].count-data[i+1].count)/data[i+1].count});
    }
    caldata.push({
      date: fns.parseISO(data[dlen-1].snapshotdate),
      close:data[dlen-1].count,
      value:0});
    console.log(caldata);
    return caldata;
  },[data]);

  if (status === 'loading') {
    return <Page center>
      <CircularProgress size="4em"/>
    </Page>
  }


  if (user===null) {
    return <Redirect to="/login"/>
  }

  const handleSnackBarClose = () => {
    setState({...state, openSnackBar: false});
  };

  return (
  <Page sx={{p:2}}>
    <Snackbar
      anchorOrigin={{ vertical:'top', horizontal:'center' }}
      open={state.openSnackBar}
      onClose={handleSnackBarClose}
      message={state.snackbarmessage}
    />
    <Typography variant="h3">Admin</Typography>
    <hr/>
    <UploadUsers/>
    <hr/>
    <CalendarChart data={caldata} options={{width:400}} onClick={console.log} sx={{background:'white'}}/>
  </Page>
  );
}

export default Admin;
