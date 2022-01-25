/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AppBar, Backdrop, Box, Button, Card, CardContent, CardHeader, CircularProgress, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs } from "@mui/material";
import { IUser, EventDataMap, IEventData } from "@psni/models";

import { DataTable,IconMenu, Page, PopupPieChart, PopupPanel, SelectColumnFilter, TabPanel, uniqueValues, UploadData} from "@psni/sharedui";
import * as d3 from "d3";
import { useMemo, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { Row } from "react-table";
import { useUser } from "../../hooks/userApi";
import { useUsersList } from "../../hooks/useUsersList";
import ScoreCard from "./scorecard";
import deepEqual from  'deep-equal';

function a11yProps(suffix:string, index:number) {
  return {
    id: `${suffix}-tab-${index}`,
    'aria-controls': `${suffix}-tabpanel-${index}`,
  };
}

const db={
  career_stage_list:["Intern", "Junior Associate", "Associate", "Senior Associate", "Manager/Specialist",null, "Sr. Manager/Sr. Specialist", "Director/Expert", "VP/Fellow", "Executive"]
};


function renderCustomDataCell({value}:any){
  if (!value) return '';
  const first= value.length?value[0]:null;
  if (!first) return '';
  return <PopupPanel buttonContent={`${value.map((e:IEventData)=>e.details?.VALUE).join(', ')}`}
    >
    <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            {Object.keys(first.details).map(key=><TableCell>{key}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {value.map((data:IEventData,idx:number)=>(
            <TableRow key={idx}>
              <TableCell>{data.timestamp.toUTCString()}</TableCell>
              {Object.keys(data.details).map(key=><TableCell>{JSON.stringify(data.details[key])}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </PopupPanel>
}
function filterCustomData(rows: Array<Row>, id:any, filterValue:any){
  return rows.filter(row => {
    const value=row.values[id]||'';
    const rowValue = `${value.length?value.map((e:IEventData)=>e.details?.VALUE).join(', '):value}`
    return rowValue !== undefined
      ? String(rowValue)
          .toLowerCase()
          .indexOf(String(filterValue).toLowerCase())!==-1
      : true
  })
}
export function TeamPage (props:RouteComponentProps) {
  const [tabIndex, setTabIndex] = useState(1);
  const [customData, setCustomData] = useState<Map<string, EventDataMap>>();
  const { user }= useUser('me');
  const {users, isLoading, error} = useUsersList();
  const history = useHistory();

  const {columns, usersData} = useMemo(()=>{
    const columns:any = [
      // {
      //   Header: '#',
      //   accessor: (row:any, i:number) => i,
      // },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
        aggregate: 'count',
        filter: 'text',
        Aggregated:(d:any)=>{
          const emails= d.cell.row.leafRows.map((v:any)=>v.original.email).join(',');
          return <a href={`mailto:${emails}`}>️✉ {d.value}</a>
        }
      },
      {
        Header: 'Title',
        accessor: 'details.title',
        Filter: SelectColumnFilter,
        filter: 'text',
      },
      {
        Header: 'Career Stage',
        type:'string',
        accessor: 'details.career_stage',
        aggregate:(v:any)=>uniqueValues(v,db.career_stage_list),
        Aggregated:({value}:any)=><PopupPieChart data={value}
          options={{width:42, height:42}}
          popupOptions={{width:350, height:350, showLabels:true}}/>,
        Filter: SelectColumnFilter,
        filter: 'includes',
      },
      {
        Header: 'Contractor',
        accessor: 'details.contractor',
        Cell:({value}:any)=>(`${value?'☑️':''}`),
        aggregate:((v:any)=>v.filter((v:any)=>v).length),
        Aggregated:({value}:any)=><span>&#8721;{value}</span>,
        filter: 'text',
      },
      {
        Header: 'Capability',
        accessor: 'details.capability',
        filter: 'text',
      },
      {
        Header: 'Primary Skill',
        accessor: 'details.primary_skill',
        filter: 'text',
      },
      {
        Header: 'Current Region',
        accessor: 'details.current_region',
        filter: 'text',
      },
      {
        Header: 'Home Region',
        accessor: 'details.home_region',
        filter: 'text',
      },
      {
        Header: 'Start Date',
        accessor: 'details.startdate',
        filter: 'text',
      },
      {
        Header: 'Client',
        accessor: 'details.client',
        filter: 'text',
      },
      {
        Header: 'Team',
        accessor: 'details.team',
        filter: 'text',
      },
      {
        Header: 'Manager',
        accessor: 'details.supervisor_name',
        filter: 'text',
      }
    ];

    const usersData = [...users];
    if (!customData) return{columns, usersData};

    const usrIndex = d3.group(usersData, u=>u.email);
    let jcount=0;
    let tcount=0;
    for(const [email, edatamap] of customData.entries()){
      let usr:any=usrIndex.get(email);
      if (usr) {
        usr=usr[0];
      } else {
        console.log('Unable to find user '+email);
        continue;
      }
      for(const [key, data] of edatamap.entries()){
        tcount+=data.length;
        const el = data[0];
        if (!el) continue;
        const cindx = columns.findIndex((c:any)=>c.Header===el.key);
        if (cindx===-1) {
          columns.push({
            Header: el.key,
            accessor: `customdata.${el.key}`,
            Cell:renderCustomDataCell,
            filter:filterCustomData
          })
        }
        if (!usr.customdata) {
          usr.customdata=new EventDataMap();
        }
        if (!usr.customdata[key]){
          usr.customdata[key]=new Array<IEventData>();
        }
        for(let i=0;i<data.length;i++) {
          const event = data[i];
          const existingList = usr.customdata[key];
          if (existingList.find((d:IEventData)=>{
            return (d.timestamp===event.timestamp && deepEqual(d.details,event.details))
          })) continue;
          usr.customdata[key] = [...existingList, event]
          jcount++;
        };
      }
    }
    console.log(`Joined data for ${jcount} events of ${tcount} records`);
    return {columns, usersData};
  }, [users, customData]);


  const handleTabChange = (_event: React.SyntheticEvent<Element, Event>, index:number)=>{
    setTabIndex(index);
  }

  const OnJoinData = (data:Map<string, EventDataMap>)=>{
    setCustomData(data)
  }

  const onRowClick = (row:any)=>{
    const usr=row.original;
    history.push(`/user/${usr.id}`);
  }

  return <Page>
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
        <Tab label="Dashboard" {...a11yProps('team', 0)} />
        <Tab label="Data" {...a11yProps('team', 1)} />
      </Tabs>
    </AppBar>
    {error?<Alert color="error">{error}</Alert>:null}
    <div style={{height:'100%', display:'flex'}}>
      <TabPanel value={tabIndex} index={0}>
        <ScoreCard user={user} users={users}/>
      </TabPanel>
      <TabPanel value={tabIndex} index={1} fullHeight>
        <Card sx={{mx:2, my:1}} elevation={0} variant="outlined">
          <CardContent>
            <Box justifyContent='space-between' alignItems='center' display="flex" width='100%' flexDirection='row'>
              <span>Users data..</span>
              <UploadData OnData={OnJoinData}/>
            </Box>
          </CardContent>
        </Card>
        <Box sx={{position: 'relative', width:'100%', height:'100%'}}>
          <Box sx={{px:2, position:'absolute', top:0, bottom:0, left:0, right:0}}>
            <Card>
              <CardContent>
                <DataTable data={usersData} columns={columns} height={800}/>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>
    </div>
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={isLoading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  </Page>
}

export default TeamPage;
