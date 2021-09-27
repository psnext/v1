import {Page, useAuth} from '@psni/sharedui';
import { Redirect, useHistory } from 'react-router-dom';
import { Box, Card, CardActionArea, CardContent, CardHeader, CardMedia, Grid, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import userdataimg from '../../assets/userdata.png';
import teamdataimg from '../../assets/teamdata.jpeg';

import { ReactComponent as Logo } from './logo.svg';
/* eslint-disable-next-line */
export interface HomeProps {
}

export function Home (props:HomeProps){
  const {user} = useAuth();
  const history = useHistory();

  if (user===null) {
    return <Redirect to='/login'/>
  }

  return (
  <Page sx={{textAlign:'center',}}>
    <Box sx={{bgcolor: 'primary.main', color:'primary.contrastText', p:2}}>
      <Box sx={{p:3}}>
        <Logo width="64"/>
      </Box>
      <Typography variant='h1'>Welcome</Typography>
      <Typography variant='h4'>unlock your next ...</Typography>
    </Box>
    <Box sx={{mt:-2, px:3, display:'flex', justifyContent:'space-around', flexWrap:'wrap'}}>
      <Card sx={{bgcolor: 'primary.main', width:400, maxWidth:'100%', color:'primary.contrastText', textAlign:'left', marginBottom:2}} elevation={6}>
        <CardActionArea onClick={()=>history.push('/user/me')}>
          <CardMedia
            component="img"
            height="140"
            image={userdataimg}
            alt="user data image"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              <PersonOutlineIcon/> Your Data
            </Typography>
            <Typography variant="body2">
              View and edit data associated with your profile.
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
      <Card sx={{bgcolor: 'primary.main', width:400, maxWidth:'100%', color:'primary.contrastText', textAlign:'left', marginBottom:2}} elevation={6}>
        <CardActionArea onClick={()=>history.push('/team')}>
          <CardMedia
            component="img"
            height="140"
            image={teamdataimg}
            alt="team data image"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              <PeopleOutlineIcon/> Teams' Data
            </Typography>
            <Typography variant="body2">
              View and edit data associated with your team.
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  </Page>
  );
}

export default Home;
