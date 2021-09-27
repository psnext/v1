import { AnchorRounded, MoreVertRounded, PeopleAltOutlined, PeopleAltTwoTone, PsychologyRounded, School, SchoolTwoTone, Settings } from "@mui/icons-material";
import { Alert, Backdrop, Card, CardContent, CardHeader, Chip, CircularProgress, IconButton, Typography } from "@mui/material";
import { Page } from "@psni/sharedui"
import { RouteComponentProps } from 'react-router-dom';
import { useUser } from "../../hooks/useUser";


export function UserPage (props:RouteComponentProps<{id?:string}>){
  const userId = props.match.params.id||'undefined';
  const { user, isLoading, error } = useUser(userId);

  return (
    <Page sx={{p:2}}>
      {error?<Alert color="error">{error.message}</Alert>:null}
      <Card>
        <CardHeader
          title={user?.name}
          subheader={user?.details.title}
          action={
            <IconButton aria-label="settings">
              <Settings />
            </IconButton>
          }
        />
        <CardContent>
          <Typography variant="caption">Manager: {user?.details.supervisor_name}</Typography><br/>
          <Chip avatar={<PsychologyRounded/>} label={user?.details.capability} color='info' variant='outlined' size="small"/>
          <Chip avatar={<AnchorRounded/>} label={user?.details.team} color='info' variant='outlined' size="small"/>
        </CardContent>

      </Card>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Page>
  )
}

export default UserPage
