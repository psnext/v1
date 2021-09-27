
import React, { useState } from 'react';
import {Page, useAuth, useQuery} from '@psni/sharedui';
import { Link, useHistory } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, CardHeader, CircularProgress,
  FormControl, FormHelperText, Icon, Input, InputAdornment, InputLabel, OutlinedInput, Snackbar, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { green } from '@mui/material/colors';
import { CodeOutlined, LockOutlined } from '@mui/icons-material';
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LoginProps {
}

export function Login (props:LoginProps){
  const history = useHistory();
  const {user, status, login, logout} = useAuth();
  const query = useQuery();
  const [state, setState] = useState({
    email: query.get('e')||'', code:'',
    isBusy: false, isCodeVerified: false,
    openSnackBar: false, snackbarmessage: '',
  })

  if (status === 'loading') {
    return <Box sx={{textAlign:'center'}}>
      <CircularProgress/>
    </Box>
  }

  const handleLogout = ()=>{
    logout()
      .then(()=>{
        setState({...state, openSnackBar:true, snackbarmessage:'Logout successful.'})
      })
  }

  if (user!==null) {
    return <Page center>
    <Card sx={{width:400}} elevation={3}>
      <CardHeader title={'Logged in as ' + user.name}
        avatar={state.isBusy?<CircularProgress/>:null}
      />
      <CardContent>
        <Box>Not {user.name}? <Button onClick={handleLogout}>Logout</Button></Box>
        <Box sx={{p:1}}/>
        <Box>Click here to <Link to={query.get('returnUrl')||'/'}>Continue.</Link></Box>
      </CardContent>
    </Card>
  </Page>
  }

  const handleOnEmailChange = (e:React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)=>{
    setState({...state, email: e.target.value});
  }

  const handleOnCodeChange = (e:React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)=>{
    setState({...state, code: e.target.value});
  }

  const handleOnRequest = async (e:React.SyntheticEvent)=>{
    e.preventDefault();
    setState({...state, isBusy:true});
    try {
      const res = await login(state.email);
      if (res.status===200){
        setState({...state, openSnackBar: true, isBusy: false,
           snackbarmessage:'Request Successful. Please check your email for code.'});
        return;
      }
      setState({...state, isBusy:false});
    } catch (ex) {
      console.error(ex);
      setState({...state, isBusy:false});
    }
  }
  const handleOnVerify = async (e:React.SyntheticEvent)=>{
    e.preventDefault();
    setState({...state, isBusy:true});
    try {
      const res = await login(state.email, state.code);
      if (res.status===200){
        const data = res.data;
        if (data.returnUrl) {
          setState({...state, isCodeVerified:true, isBusy: false, openSnackBar: true, snackbarmessage: 'Sucessfully verified the code.'});
        }
        return;
      }
      setState({...state, isCodeVerified:false, isBusy: false});
    } catch (ex) {
      console.error(ex);
      setState({...state, isCodeVerified:false, isBusy: false});
    }
  }
  const handleSnackBarClose = () => {
    setState({...state, openSnackBar: false});
  };

  return (
  <Page center sx={{}}>
    <Snackbar
      anchorOrigin={{ vertical:'top', horizontal:'center' }}
      open={state.openSnackBar}
      onClose={handleSnackBarClose}
      message={state.snackbarmessage}
    />
    <Card sx={{width:400}} elevation={3}>
      <CardHeader title={'Request Access Code'}
        avatar={state.isBusy?<CircularProgress/>:null}
      />
      <CardContent>
        {state.isCodeVerified?(
          <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <Box sx={{color: green[500]}}><LockOutlined/></Box>
            Verified !
            <Link to={'/'}>Continue</Link>
          </Box>
        ):(
          <>
            <FormControl fullWidth disabled={state.isBusy}>
              <InputLabel htmlFor="email-input">Email Address</InputLabel>
              <OutlinedInput id="email-input" aria-describedby="email-helper-text"
                label='Email Address' placeholder='user@publicissapient.com'
                value={state.email} onChange={handleOnEmailChange} endAdornment={
                  <InputAdornment position="end">
                    <Button variant="contained" onClick={handleOnRequest} style={{width:'10ch'}}>Request</Button>
                  </InputAdornment>
                } type='email' margin='dense'
              />
              <FormHelperText id="email-helper-text"> </FormHelperText>
            </FormControl>

            <Box sx={{p:1}}/>

            <FormControl fullWidth disabled={state.isBusy||(state.email==='')}>
              <InputLabel htmlFor="email-input">Access Code</InputLabel>
              <OutlinedInput id="code-input" aria-describedby="code-helper-text"
                label='Access Code' placeholder='123 456'
                value={state.code} onChange={handleOnCodeChange} endAdornment={
                  <InputAdornment position="end">
                    <Button variant="contained" onClick={handleOnVerify} style={{width:'10ch'}}>Verify</Button>
                  </InputAdornment>
                } type='number' margin='dense'
              />
              <FormHelperText id="code-helper-text"> </FormHelperText>
            </FormControl>
          </>
        )}
      </CardContent>
    </Card>
  </Page>
  );
}

export default Login;
