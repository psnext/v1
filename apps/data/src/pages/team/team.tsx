/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AppBar, Backdrop, Box, Button, Card, CardContent, CardHeader, CircularProgress, Tab, Tabs } from "@mui/material";
import { IUser, IUserCustomData } from "@psni/models";

import { DataTable, Page, PopupPieChart, SelectColumnFilter, TabPanel, uniqueValues, UploadData} from "@psni/sharedui";
import * as d3 from "d3";
import { useMemo, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { useUsersList } from "../../hooks/useUsersList";
import ScoreCard from "./scorecard";


function a11yProps(suffix:string, index:number) {
  return {
    id: `${suffix}-tab-${index}`,
    'aria-controls': `${suffix}-tabpanel-${index}`,
  };
}

const db={
  career_stage_list:["Intern", "Junior Associate", "Associate", "Senior Associate", "Manager/Specialist",null, "Sr. Manager/Sr. Specialist", "Director/Expert", "VP/Fellow", "Executive"]
};

export function TeamPage (props:RouteComponentProps) {
  const [tabIndex, setTabIndex] = useState(1);
  const { user }= useUser('me');
  const {users, isLoading, error} = useUsersList();

  const columns = useMemo(
    () => [
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
    ],
    []
  );

  const handleTabChange = (_event: React.SyntheticEvent<Element, Event>, index:number)=>{
    setTabIndex(index);
  }

  const OnJoinData = (data:Array<IUserCustomData>)=>{
    const usrIndex = d3.group(users,u=>u.email);
    console.log(data);
    data.forEach((cdata:IUserCustomData) => {
      const usr=usrIndex.get(cdata.email);
      if (usr) {
        // if (!usr.details.custom) {
        //   usr.details.custom
        // }
      }
    });
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
                <DataTable data={users} columns={columns} height={800}/>
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
