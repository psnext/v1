import {useState, useEffect} from 'react';
import { Alert, Button, CircularProgress, Container, FormControl, Stack, TextField } from '@mui/material';
import './app.module.css';
import Welcome from './welcome';

function useTimer({startTime, interval}){
  const [elapsedTime, setElapsedTime] = useState(0);
  useEffect(()=>{
    const handle = setTimeout(()=>{
      setElapsedTime(Date.now()-startTime)
    }, interval);

    return ()=>{
      clearTimeout(handle);
    }
  })
  return elapsedTime;
}

export function App() {
  const [teamname, setTeamName] = useState();
  const [teamnameerror, setTeamNameError] = useState('Please enter a valid team name');
  const [teamcode, setTeamCode] = useState();
  const [teamcodeerror, setTeamCodeError] = useState('Please enter a valid team code');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState(null)
  const [startTime, setStartTime] = useState();

  const handleTeamNameChange = (e)=>{
    const tn=e.target.value;
    setTeamName(tn);
    if (tn.trim()==='') {
      setTeamNameError('Invalid team name');
    } else setTeamNameError(null);
  }

  const handleTeamCodeChange = (e)=>{
    const tc=e.target.value;
    setTeamCode(tc);
    if (tc.trim()===''){
      setTeamCodeError('Invalid team code');
    } else setTeamCodeError(null);
  }

  const onStart = ()=>{
    setIsBusy(true);
    setTimeout(()=>{
      setError('Invalid team name or code. Please try again or contact the organisers for the correct code')
      setIsBusy(false);
    }, 3000)
  }

  return (
    <>
      <section style={{margin:'0 auto', minWidth:'1024px', textAlign:'center'}}>
        <div id="i-hero" style={{width:'100%'}}>
          <img src='../assets/herobanner.png' alt='aspire hackathon banner' style={{ width:'100%', maxWidth:'1024px'}}/>
        </div>
        <div style={{ width:'75ch', textAlign:'center', margin:'0 auto', borderRadius: '1.5em', padding: '1em',
          boxShadow:'0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgb(0 0 0 / 10%), 0 4px 6px -2px rgb(0 0 0 / 5%)'}}>
            <p>Please enter the your team name &amp; team code to start the hackathon</p>
            {error?<Alert severity='error'>{error}</Alert>:null}
            <Stack spacing={2}>
              <TextField disabled={isBusy}
                required error={teamnameerror?true:false}
                id="team-name"
                label="Team Name"
                value={teamname}
                onChange={handleTeamNameChange}
                type='text'
                style={{backgroundColor:'white'}}
                helperText={teamnameerror}
              />
              <TextField disabled={isBusy}
                required error={teamcodeerror?true:false}
                id="team-code"
                label="Team Code"
                value={teamcode}
                onChange={handleTeamCodeChange}
                type='number'
                style={{backgroundColor:'white'}}
                helperText={teamcodeerror}
              />
              <Button variant="contained" color='success' onClick={onStart} disabled={isBusy}>
                {isBusy?<CircularProgress/>:'Start'}
              </Button>
            </Stack>
        </div>
      </section>
      <Welcome className="hackathon" />
      <div />
    </>
  );
}
export default App;
