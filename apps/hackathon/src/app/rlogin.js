import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import { Alert, Button, CircularProgress, Container, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';


export default function RLogin() {
  const history  = useHistory();
  const [error, setError] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [remail, setREmail] = useState('');
  const [remailerror, setREmailError] = useState(null);
  const [rcode, setRCode] = useState('');
  const [rcodeerror, setRCodeError] = useState(null);
  const [capability, setCapability] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(window.localStorage.getItem('isl'))

  const handleCChange =(e)=>{
    const value = e.target.value;
    setCapability(value);
  }

  const handleREmailChange =(e)=>{
    setREmail(e.target.value.toLowerCase());
  }

  const handleRCodeChange =(e)=>{
    setRCode(e.target.value);
  }

  const onLogin = ()=>{
    if (capability==='') {
      setError('Please select a capability')
      return;
    }
    if (rcode==='') {
      setRCodeError('Please enter your code')
      return;
    }
    if (remail==='') {
      setREmailError('Please enter your email')
      return;
    }
    setError(null);
    setIsBusy(true);

    if (rcode==='aspire123') {
      window.localStorage.setItem('isl', remail);
      window.localStorage.setItem('rd',`${remail},${capability}`);
      setIsLoggedIn(remail);
      history.push('/rscore');
    } else {
      setError('Inavlid code');
    }

    setIsBusy(false);
  }

  if (isLoggedIn!==null) {
    history.push('/rscore');
  }

  return <Container maxWidth="md" sx={{textAlign:'center', padding:'2em'}}>
    <div style={{
      boxShadow: '0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      borderRadius: '1.5em'
    }}>
      <Typography variant='h3'>Login</Typography>
      <Stack spacing={2} sx={{padding:'1.5em'}}>
        <TextField disabled={isBusy}
                required error={remailerror?true:false}
                id="r-email"
                label="Reviewer Email"
                value={remail}
                onChange={handleREmailChange}
                type='email'
                style={{backgroundColor:'white'}}
                helperText={remailerror}/>
        <TextField disabled={isBusy}
                required error={rcodeerror?true:false}
                id="r-name-code"
                label="Reviewer Code"
                value={rcode}
                onChange={handleRCodeChange}
                type='text'
                style={{backgroundColor:'white'}}
                helperText={rcodeerror}/>
        <FormControl>
          <InputLabel id="cselect-label">Capability</InputLabel>
          <Select
            labelId='cselect-label'
            id="capability-select"
            value={capability}
            label="Capability"
            onChange={handleCChange}
          >
            <MenuItem value={'Strategy'}>Strategy</MenuItem>
            <MenuItem value={'Product'}>Product</MenuItem>
            <MenuItem value={'Experience'}>Experience</MenuItem>
            <MenuItem value={'Engineering'}>Engineering</MenuItem>
            <MenuItem value={'Data'}>Data</MenuItem>
          </Select>
        </FormControl>

        {error?<Alert severity='error'>{error}</Alert>:null}
        <Button onClick={onLogin} variant="contained" color='success' disabled={isBusy}>{isBusy?<CircularProgress/>:'Login'}</Button>
      </Stack>
    </div>
  </Container>
}
