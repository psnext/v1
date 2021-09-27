import { AppBar, Backdrop, Box, Card, CardContent, CardHeader, CircularProgress, Tab, Tabs } from "@mui/material";
import { DataTable, Page, TabPanel } from "@psni/sharedui";
import axios from "axios";
import { relative } from "path";
import { useMemo, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import useSWR from "swr";
import { useUsersList } from "../../hooks/useUsersList";


function a11yProps(suffix:string, index:number) {
  return {
    id: `${suffix}-tab-${index}`,
    'aria-controls': `${suffix}-tabpanel-${index}`,
  };
}


const fetcher = (url:string) => axios.get(url).then(res => res.data)

export function TeamPage (props:RouteComponentProps) {
  const [tabIndex, setTabIndex] = useState(1);
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
      },
      {
        Header: 'Title',
        accessor: 'details.title',
      },
      {
        Header: 'Career Stage',
        accessor: 'details.career_stage',
      },
      {
        Header: 'Capability',
        accessor: 'details.capability',
      },
      {
        Header: 'Client',
        accessor: 'details.client',
      },
      {
        Header: 'Team',
        accessor: 'details.team',
      },
      {
        Header: 'Manager',
        accessor: 'details.supervisor_name',
      }
    ],
    []
  );

  const handleTabChange = (_event: React.SyntheticEvent<Element, Event>, index:number)=>{
    setTabIndex(index);
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
        <Tab label="Scorecard" {...a11yProps('team', 0)} />
        <Tab label="Data" {...a11yProps('team', 1)} />
      </Tabs>
    </AppBar>
    <div style={{height:'100%', display:'flex'}}>
      <TabPanel value={tabIndex} index={0}>
        <Box sx={{p:2}}>
          Scorecard
        </Box>
      </TabPanel>
      <TabPanel value={tabIndex} index={1} fullHeight>
        <Card sx={{mx:2, my:1}} elevation={0} variant="outlined">
          <CardHeader title={'Users data..'}/>
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
