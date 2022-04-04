import { Alert, Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import PropTypes from 'prop-types';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import useSWR,{useSWRConfig} from 'swr';
import Bar from './bar';
import {findgroup} from './groups';

const fetcher = (...args) => fetch(...args).then(res => res.json());

export default function RSummary() {
  const history = useHistory();

  if (window.localStorage.getItem('isl')===null) {
    history.push('/rlogin');
    return <Container maxWidth='md'>
      <a href="/rlogin">Login required</a>
    </Container>
  }

  return  <Container maxWidth="lg" sx={{textAlign:'center', padding:'2em'}}>
    <Box sx={{ boxShadow: '0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      borderRadius: '1.5em'
    }}>
      <Typography variant='h3'>Aspire Speed Hackathon</Typography>
      <Typography variant='h4'>Scoring Summary</Typography>
      <hr/>
      <ScoringTable/>
    </Box>
  </Container>
}

function createData(teamid, init=1) {
  const capability=['Stategy', 'Product', 'Experience', 'Engineering', 'Data & AI'];
  const s=Math.random()*2*init;
  const p=Math.random()*4*init;
  const x=Math.random()*4*init;
  const e=Math.random()*7*init;
  const d=Math.random()*2*init;
  const c=Math.random()*5*init;

  const details=[];
  const maxdetails=Math.random()*10*init;
  for(let i=0;i<maxdetails;i++) {
    details.push({
      email: `user${(Math.random()*100).toFixed(0)}@example.com`,
      score: Math.random()*2 + Math.random()*5,
      maxscore: 7,
      capability:init?capability[Math.floor(Math.random()*(capability.length-1))]:'',
      comments:''
    })
  }
  return {
    teamid,
    total:(s+p+x+e+d+c),
    s, scount:0,
    p, pcount:0,
    x, xcount:0,
    e, ecount:0,
    d, dcount:0,
    c,
    details
  };
}

const rows = [
  createData('ASH0100'),
  createData('ASH0101'),
  createData('ASH0102'),
  createData('ASH0103'),
  createData('ASH0104'),
];

function ScoringTable() {
  const {data, error} = useSWR(`/api/hackathon/rscore`, fetcher);
  if (!data) {
    return <CircularProgress/>
  }
  if (error) {
    return <Alert severity='error'>Ubale to fetch the scores: {error}</Alert>
  }

  const teamindex = {}
  const teams=[];

  data.forEach(d=>{
     let team=teamindex[d.teamid];
     if (!team) {
       team = createData(d.teamid,0);
       teamindex[d.teamid] = team;
       teams.push(team);
     }
     d.scoredetails.c=((d.scoredetails.c1||0) + (d.scoredetails.c2||0) + (d.scoredetails.c3||0) + (d.scoredetails.c4||0) + (d.scoredetails.c5||0));
     team.details.push({email:d.remail, capability: d.capability, score:d.score, maxscore: d.maxscore, comments:d.comments,
      problemstatement:d.problemstatement, scoredetails:d.scoredetails });
     switch(d.capability) {
        case 'Strategy':{
          team.scount+=1;
          team.s+=((d.scoredetails.S1||0) + (d.scoredetails.s2||0));
          break;
        }
        case 'Product':{
          team.pcount+=1;
          team.p+=((d.scoredetails.p1||0) + (d.scoredetails.p2||0) + (d.scoredetails.p3||0));
          break;
        }
        case 'Experience':{
          team.xcount+=1;
          team.x+=((d.scoredetails.x1||0) + (d.scoredetails.x2||0) + (d.scoredetails.x3||0));
          break;
        }
        case 'Engineering':{
          team.ecount+=1;
          team.e+=((d.scoredetails.e1||0) + (d.scoredetails.e2||0) + (d.scoredetails.e3||0));
          break;
        }
        case 'Data':{
          team.dcount+=1;
          team.d+=((d.scoredetails.d1||0) + (d.scoredetails.d2||0));
          break;
        }
     }
     team.c+=d.scoredetails.c;
  })

  teams.forEach(t=>{
    var ps=new Set(t.details.map(d=>d.problemstatement));
    t.problemstatement='';
    for(const p of ps.values()){
      t.problemstatement+=' '+p;
    }
    t.s/=(t.scount||1); t.p/=(t.pcount||1); t.x/=(t.xcount||1); t.e/=(t.ecount||1); t.d/=(t.dcount||1);
    t.c/=t.details.length;
    t.total=t.s+t.p+t.x+t.e+t.d+t.c;
    t.maxscore=24;
  })
  return  (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Team</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">Strategy (2)</TableCell>
            <TableCell align="right">Product (4)</TableCell>
            <TableCell align="right">Experience (4)</TableCell>
            <TableCell align="right">Engineering (7)</TableCell>
            <TableCell align="right">Data &amp; AI (2)</TableCell>
            <TableCell align="right">Core Values (5)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teams.sort((a,b)=>b.total-a.total).map((row) => (
            <Row key={row.teamid} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.teamid} - {findgroup(row.teamid)}<br/>
          <small><em>{row.problemstatement}</em></small>
        </TableCell>
        <TableCell align="right"><Bar score={row.total} maxscore={24}/></TableCell>
        <TableCell align="right"><Bar score={row.s} maxscore={2}/></TableCell>
        <TableCell align="right"><Bar score={row.p} maxscore={4}/></TableCell>
        <TableCell align="right"><Bar score={row.x} maxscore={4}/></TableCell>
        <TableCell align="right"><Bar score={row.e} maxscore={7}/></TableCell>
        <TableCell align="right"><Bar score={row.d} maxscore={2}/></TableCell>
        <TableCell align="right"><Bar score={row.c} maxscore={5}/></TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {/* <Typography variant="caption" gutterBottom component="div">
                Details
              </Typography> */}
              <Table size="small" aria-label="scores">
                <TableHead>
                  <TableRow>
                    <TableCell>Reviewer</TableCell>
                    <TableCell>Capability</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Core Values</TableCell>
                    <TableCell>Comments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.details.sort((a,b)=>b.score-a.score).map((drow) => (
                    <TableRow key={drow.email}>
                      <TableCell component="th" scope="row">
                        {drow.email}
                      </TableCell>
                      <TableCell>{drow.capability}</TableCell>
                      <TableCell align="right"><Bar score={drow.score - drow.scoredetails.c} maxscore={drow.maxscore-5}/></TableCell>
                      <TableCell align="right"><Bar score={drow.scoredetails.c} maxscore={5}/></TableCell>
                      <TableCell>{drow.comments}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}
