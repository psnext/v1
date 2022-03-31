import { Button, Container, Typography } from '@mui/material';
import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

export function LogoutButton () {
  const history  = useHistory();

  const handleLogout = ()=>{
    window.localStorage.removeItem('isl');
    window.localStorage.removeItem('rd');
    history.push('/rlogin');
  }
  return <Button variant="contained" color='success' onClick={handleLogout}>Logout</Button>
}
export default function RLogout() {


  return  <Container maxWidth="md" sx={{textAlign:'center', padding:'2em'}}>
    <div style={{
      boxShadow: '0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      borderRadius: '1.5em'
    }}>
      <LogoutButton/>
      <br/><br/>
    </div>
  </Container>
}
