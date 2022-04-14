/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useState, useEffect } from 'react';
import {CalendarChart, Page, TabPanel, useAuth, useQuery} from '@psni/sharedui';
import { Link, Redirect, useHistory } from 'react-router-dom';
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Box, Button, Card, CardActions, CardContent, CardHeader, CircularProgress,
  FormControl, FormHelperText, Grid, Icon, Input, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, Snackbar, Tab, Tabs, TextField, Typography } from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as fns from 'date-fns';
import UploadUsers from './upload_users';
import { useSnapshotDates } from '../../hooks/useSnapshotDates';
import { SelectUsers } from "../../components/SelectUsers";
import { useUsersList } from "../../hooks/useUsersList";
import { useUser } from '../../hooks/userApi';
import { UserPermissions } from '../user/UserPermissions';
import useSWR from 'swr';
import { fetcher } from '../../hooks/fetcher';

const getJsonIndented = (newObj:any) => JSON.stringify(newObj, null, 4).replace(/["{[,}\]]/g, "").replace(/(\s+)(\w+):\s/g, "<span><em>$1$2</em>:&nbsp;</span>")

const JSONDisplayer = (props:any) => (
  <Box sx={{backgroundColor:'#333333', color:'#ffffff'}}>
    <pre dangerouslySetInnerHTML={{ __html:getJsonIndented(props.children)}}></pre>
  </Box>
)

function AddRole(props:any){
  const { data=[], error } = useSWR('/api/roles/', fetcher)
  const [role, setRole] = React.useState('');
  const [cpCondition, setCPCondition] = useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value as string);
    // if (props.onChange) {
    //   props.onChange(event);
    // }
  };

  // const handleCustomPermissionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setCustompermission(event.target.value);
  // }

  const handleCPConditionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCPCondition(event.target.value);
  }

  const handleAdd = () => {
    if (role==='') return;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const request = new Request(`/api/users/${props.userId}/roles`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({roleid: role}),
    });

    fetch(request)
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setRole('');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const handleCustomPermissionAdd = () => {
    if (cpCondition==='') return;

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const request = new Request(`/api/users/${props.userId}/custompermissions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({permission: 'Users.Read.Custom', condition:cpCondition}),
    });

    fetch(request)
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setRole('');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const handleResetPermission = () => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const request = new Request(`/api/users/${props.userId}/permissions/resetcache`, {
      method: 'GET',
      headers: headers,
    });

    fetch(request)
      .then(response => {
        console.log('Success:');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  return (
    <Box sx={{ minWidth: 120, py:1 }}>
      <Grid container spacing={1} alignContent='center'>
        <Grid item sm={4}>
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={role}
              label="Role"
              onChange={handleChange}
            >
              {data.map((r:any)=><MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item sm={2} >
          <Button variant='outlined' onClick={handleAdd} fullWidth>Add Role</Button>
        </Grid>
        <Grid item sm={4}>
          <TextField
            label='Custom Permission'
            value={cpCondition}
            onChange={handleCPConditionChange}
            defaultValue={`(details @> '{"team":"Team Retail"}'::jsonb)`}
            fullWidth/>
        </Grid>
        <Grid item sm={2}>
          <Button variant='outlined' onClick={handleCustomPermissionAdd} fullWidth>Add Custom Permission</Button>
        </Grid>
        <Grid item sm={4}>
          <Button variant='outlined' onClick={handleResetPermission} size='small' fullWidth>Reset Permissions Cache</Button>
        </Grid>
      </Grid>
    </Box>
  );
}

function UserAdminPanel() {
  const { user }= useUser('me');
  const {users, isLoading, error} = useUsersList('any');
  const [selectedUsers, setSelectedUsers] = useState<Array<any>>([]);
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  useEffect(()=>{
    if (user) {
      if (selectedUsers.length===0) {
        setSelectedUsers([user]);
      }
    }
  },[user]);

  return <Card sx={{mx:2, my:1, minHeight:200}} elevation={0} variant="outlined">
    <CardContent>
    <SelectUsers users={users} selected={selectedUsers} onChange={(l:any)=>l.length>0?setSelectedUsers(l):setSelectedUsers([user])}/>
    <hr/>
    {selectedUsers.map((u)=><Accordion key={u.id} expanded={expanded === u.id} onChange={handleChange(u.id)}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="userpanel-content"
          id="userpanel-header"
        >
          <Typography sx={{ width: '33%', flexShrink: 0 }}>
            {u.name}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>{u.details.title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <hr/>
          <h6>Data dump</h6>
          <JSONDisplayer>{u}</JSONDisplayer>
          <br/>
          <hr/>
          <AddRole userId={u.id}/>
          <br/>
          <hr/>
          <Typography variant='caption'>Permissions</Typography>
          <UserPermissions id={u.id}/>
        </AccordionDetails>
      </Accordion>)}
  </CardContent>
  </Card>
}


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AdminProps {
}

export function Admin (props:AdminProps){
  const [tabIndex, setTabIndex] = useState(1);
  const history = useHistory();
  const {user, status} = useAuth();
  const {data, isLoading} = useSnapshotDates();
  const query = useQuery();
  const [state, setState] = useState({
    email: query.get('e')||'', code:'',
    isBusy: false, isCodeVerified: false,
    openSnackBar: false, snackbarmessage: '',
  })

  const handleTabChange = (_event: React.SyntheticEvent<Element, Event>, index:number)=>{
    setTabIndex(index);
  }
  const caldata = useMemo(()=>{
    const caldata:Array<{date:Date, value:number, close: number}> = [];

    if (!data || data.length===0) return caldata;

    const dlen=data.length;
    for(let i=0;i<dlen-1;i++){
      caldata.push({
        date: fns.parseISO(data[i].snapshotdate),
        close: data[i].count,
        value:(data[i].count-data[i+1].count)/data[i+1].count
      });
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
  <Page >
  <AppBar position="static">
    <Box sx={{minHeight:48}}/>
    <Tabs
      value={tabIndex}
      onChange={handleTabChange}
      indicatorColor="secondary"
      textColor="inherit"
      variant="fullWidth"
      aria-label="full width tabs example"
    >
      <Tab label="Dashboard"/>
      <Tab label="Data"/>
      <Tab label="Users"/>
    </Tabs>
  </AppBar>
    <Snackbar
      anchorOrigin={{ vertical:'top', horizontal:'center' }}
      open={state.openSnackBar}
      onClose={handleSnackBarClose}
      message={state.snackbarmessage}
    />
    <div style={{height:'calc(100% - 8em)'}}>
      <TabPanel value={tabIndex} index={0} fullHeight>
      </TabPanel>
      <TabPanel value={tabIndex} index={1} fullHeight>
        <Card sx={{mx:2, my:1}} elevation={0} variant="outlined">
          <CardContent>
            <Typography variant="h4">Data</Typography>
            <UploadUsers/>
            <hr/>
            <CalendarChart data={caldata} options={{width:400}} onClick={console.log} sx={{background:'white'}}/>
          </CardContent>
        </Card>
      </TabPanel>
      <TabPanel value={tabIndex} index={2} fullHeight>
        <UserAdminPanel/>
      </TabPanel>
    </div>
  </Page>
  );
}

export default Admin;
