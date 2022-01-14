/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useState, useEffect } from 'react';
import {CalendarChart, Page, TabPanel, useAuth, useQuery} from '@psni/sharedui';
import { Link, Redirect, useHistory } from 'react-router-dom';
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Box, Button, Card, CardActions, CardContent, CardHeader, CircularProgress,
  FormControl, FormHelperText, Icon, Input, InputAdornment, InputLabel, OutlinedInput, Snackbar, Tab, Tabs, TextField, Typography } from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as fns from 'date-fns';
import UploadUsers from './upload_users';
import { useSnapshotDates } from '../../hooks/useSnapshotDates';
import { SelectUsers } from "../../components/SelectUsers";
import { useUsersList } from "../../hooks/useUsersList";
import { useUser } from '../../hooks/userApi';
import { UserPermissions } from '../user/UserPermissions';

const getJsonIndented = (newObj:any) => JSON.stringify(newObj, null, 4).replace(/["{[,}\]]/g, "").replace(/(\s+)(\w+):\s/g, "<span><em>$1$2</em>:&nbsp;</span>")

const JSONDisplayer = (props:any) => (
  <Box sx={{backgroundColor:'#333333', color:'#ffffff'}}>
    <pre dangerouslySetInnerHTML={{ __html:getJsonIndented(props.children)}}></pre>
  </Box>
)

function UserAdminPanel() {
  const { user }= useUser('me');
  const {users, isLoading, error} = useUsersList();
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
  </Page>
  );
}

export default Admin;
