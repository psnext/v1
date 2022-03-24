import {useState, useEffect} from 'react';
import { Alert, Button, CircularProgress, Container, FormControl, Stack, TextField } from '@mui/material';
import './app.module.css';
import Welcome from './welcome';


export function App() {
  const [teamname, setTeamName] = useState('');
  const [teamnameerror, setTeamNameError] = useState('Please enter a valid team name');
  const [teamcode, setTeamCode] = useState('');
  const [teamcodeerror, setTeamCodeError] = useState('Please enter a valid team code');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState(null)
  const [startTime, setStartTime] = useState(null);

  const handleTeamNameChange = (e)=>{
    const tn=e.target.value;
    setTeamName(tn);
    if (tn.trim()==='') {
      setTeamNameError('Invalid team id');
    } else setTeamNameError(null);
  }

  const handleTeamCodeChange = (e)=>{
    const tc=e.target.value;
    setTeamCode(tc);
    if (tc.trim()===''){
      setTeamCodeError('Invalid team code');
    } else setTeamCodeError(null);
  }

  const onStart = async ()=>{
    setIsBusy(true);
    // setTimeout(()=>{
    //   if (teamname==="test" && teamcode==='1234') {
    //     setStartTime(Date.now());
    //     return;
    //   }

    //   setError('Invalid team name or code. Please try again or contact the organisers for the correct code')
    //   setIsBusy(false);
    // }, 3000)

    try{
      const res = await fetch('/api/hackathon/start',{
        method:'POST',
        body:JSON.stringify({ teamid:teamname, teamcode}),
        headers:{
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setStartTime(Date.parse(data.starttime));
      } else {
        setError(data.error || 'Unable to start, please try again.')
      }
    } catch(ex) {
      let data = {error:'Unable to start, please try again.'};
      setError(data.error);
      console.error(ex)
    }
    finally{
      setIsBusy(false);
    }
  }

  return (
    <>
      <section style={{margin:'0 auto', minWidth:'1024px', textAlign:'center'}}>
        <div id="i-hero" style={{width:'100%'}}>
          <img src='../assets/herobanner.png' alt='aspire hackathon banner' style={{ width:'100%', maxWidth:'1024px'}}/>
        </div>
        <div style={{ width:'75ch', textAlign:'center', margin:'0 auto', borderRadius: '1.5em', padding: '1em',
          boxShadow:'0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgb(0 0 0 / 10%), 0 4px 6px -2px rgb(0 0 0 / 5%)'}}>

            {startTime?<Welcome className="hackathon" startTime={startTime} />:<Stack spacing={2}>
              <p>Please enter the your team id &amp; team code to start the hackathon</p>

              <p style={{color:'red'}}>Note: once you login your 48 hour working window will begin.</p>
              {error?<Alert severity='error'>{error}</Alert>:null}

              <TextField disabled={isBusy}
                required error={teamnameerror?true:false}
                id="team-name"
                label="Team ID"
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
            </Stack>}
        </div>
      </section>
      <div />
    </>
  );
}
export default App;
