import { Autocomplete, Box, Button, CircularProgress, Container, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Slider, Step, StepContent, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import {useHistory} from 'react-router-dom'
import React from 'react';


import useSWR from 'swr';
const fetcher = (...args) => fetch(...args).then(res => res.json());



const steps = [
  {
    id:'S1',
    capability:'Strategy',
    label: 'S1: Ignite & Hunt',
    maxscore: 1,
    description: <>
      <p>
      Does the solution either create new value, increase profits, or reduce costs? How?
      </p>

      <p>
        <em>the team should provide a clear
        statement of what
        need is being
        addressed.</em>
      </p>
    </>,
  },
  {
    id:'s2',
    capability:'Strategy',
    label: 'S2: Shape & Incubate',
    maxscore: 1,
    description: <>
      <p>
        How is the solution
        differentiated from
        what’s in the market?
      </p>

      <p>
        <em>
          the team should, clearly define the propositions to
          address that need and what is the plan to test them..
        </em>
      </p>
    </>,
  },

  {
    id:'p1',
    capability:'Product',
    label: 'P1: Ignite & Hunt',
    maxscore: 1,
    description: <>
      <p>
        Product Hypothesis Statement – What need does the solution solve?
      </p>

      <p>
        <em>the team should provide a clear statement of what need is being addressed.</em>
      </p>
    </>,
  },
  {
    id:'p2',
    capability:'Product',
    label: 'P2: Shape & Incubate',
    maxscore: 1,
    description: <>
      <p>
        How is the solution differentiated from what’s in the market?
      </p>

      <p>
        <em>
          the team should, clearly define the propositions to address that need and what is the plan to test them..
        </em>
      </p>
    </>,
  },
  {
    id:'p3',
    capability:'Product',
    label: 'P3: Build',
    maxscore: 2,
    description: <>
      <p>
        What are the five next Epics (issues to address) the team will build? How have they prioritized those?
      </p>

      <p>
        <em>the team should, Build a product to demo the solution.</em>
      </p>
    </>,
  },

  {
    id:'x1',
    capability:'Experience',
    label: 'X1: Ignite & Hunt',
    maxscore: 1,
    description: <>
      <p>
        Did the team tell the ‘who’ and ‘why’ story and not the ‘what’ and ‘how’.
        Do they tell an empathetic story which allows them
        to connect to the target audience and
        places them in a future that is better for them
        and that we care about.
      </p>

      <p>
        <em>the team should provide a clear statement of what need is being addressed.</em>
      </p>
    </>,
  },
  {
    id:'x2',
    capability:'Experience',
    label: 'X2: Shape & Incubate',
    maxscore: 1,
    description: <>
      <p>
        How does team solution solution innovatively address either new
        and/or previously unmet needs of their target audience?
        What are the moments of truth and/or key features that underpin
        and differentiate their proposition?
      </p>

      <p>
        <em>
          the team should, clearly define the propositions to address that need and what is the plan to test them..
        </em>
      </p>
    </>,
  },
  {
    id:'x3',
    capability:'Experience',
    label: 'X3: Build',
    maxscore: 2,
    description: <>
      <p>
        How have the team addressed those unmet needs or incorporated those
        differentiating features through a wellexecuted
        product and rich interaction/UI design?
      </p>

      <p>
        <em>the team should, Build a product to demo the solution.</em>
      </p>
    </>,
  },

  {
    id:'e1',
    capability:'Engineering',
    label: 'E1: Shape & Incubate',
    maxscore: 2,
    description: <>
      <p>
        How did the team use traditional technology in an unconventional
        manner, or unconventional technology to solve a
        typical engineering problem?
      </p>

      <p>
        <em>the team should, clearly define the
          propositions to
          address that need
          and what is the
          plan to test them.
        </em>
      </p>
    </>,
  },
  {
    id:'e2',
    capability:'Engineering',
    label: 'E2: Build',
    maxscore: 1,
    description: <>
      <p>
        How do you rate the teams effort in building a working demo/solution?
      </p>

      <p>
        <em>the team should, Build a product to demo the solution.
        </em>
      </p>
    </>,
  },
  {
    id:'e3',
    capability:'Engineering',
    label: 'E3: Build',
    maxscore: 4,
    description: <>
      <p>
        Have the teams used accelerators to enable
        the product to be realized?
        How has scalability been considered for this solution?
      </p>

      <p>
        <em>the team should, Build a product to demo the solution.
        </em>
      </p>
    </>,
  },

  {
    id:'d1',
    capability:'Data',
    label: 'D1: Shape & Incubate',
    maxscore: 1,
    description: <>
      <p>
        How did the team use of Data &mp; AI unlock new
        opportunities that did not exist before?
      </p>

      <p>
        <em>the team should, clearly define the
          propositions to address that need
          and what is the plan to test them.
        </em>
      </p>
    </>,
  },
  {
    id:'d2',
    capability:'Data',
    label: 'D2: Build',
    maxscore: 2,
    description: <>
      <p>
        How can the solution create a Data flywheel (more data
        insights -&gt; more users -&gt; more insights) or
        have the potential of creating one?
      </p>

      <p>
        <em>the team should, Build a product to demo the solution.
        </em>
      </p>
    </>,
  },

  {
    id:'c1',
    capability:'Core Values',
    label: 'C1: Engaging with Openness',
    maxscore: 1,
    description: <p>
        Share and seek ideas and dialogue openly to deepen understanding and connection with others.
      </p>,
  },
  {
    id:'c2',
    capability:'Core Values',
    label: 'C2: Learning Mindset',
    maxscore: 1,
    description: <p>
        Find the courage to question what we know, take risks and learn continuously to unlock potential in ourselves and others.
      </p>,
  },
  {
    id:'c3',
    capability:'Core Values',
    label: 'C3: Inclusive Collaboration',
    maxscore: 1,
    description: <p>
        Create space for multiple voices and integrate diverse perspectives to realize shared goals.
      </p>,
  },
  {
    id:'c4',
    capability:'Core Values',
    label: 'C4: Partnering for Client Impact',
    maxscore: 1,
    description: <p>
        Care about our clients' problems and partner for extraordinary impact and long-term, sustained success.
      </p>,
  },
  {
    id:'c5',
    capability:'Core Values',
    label: 'C5: Embracing the Future',
    maxscore: 1,
    description: <p>
        Generate possibilities and use the power of creativity to innovate in ways that matter to people.
      </p>,
  },


];

function VerticalLinearStepper({capability}) {

  const fsteps = steps.filter((s)=>(s.capability===capability || s.capability==='Core Values'));
  //const fsteps = steps;
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ maxWidth: '100%' }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {fsteps.map((step, index) => (
          <Step key={step.id}>
            <StepLabel
              optional={null}
              //   index === 2 ? (
              //     <Typography variant="caption">Last step</Typography>
              //   ) : null
              // }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              {step.description}
              <>
                <span>Max Score: <strong>{step.maxscore}</strong></span>
                <Slider
                  defaultValue={0}
                  valueLabelDisplay="on"
                  step={0.1}
                  marks
                  min={0}
                  max={step.maxscore}
                />
              </>
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Reset
          </Button>
        </Paper>
      )}
    </Box>
  );
}


export default function RScore() {
  const history = useHistory();
  const [team, setTeam] = React.useState(null);
  const { data, error } = useSWR('/api/hackathon/data', fetcher);

  //const teams = [...new Array(50)].map((d,i)=>({name:`ASH0${100+i}`}));
  if (window.localStorage.getItem('isl')===null) {
    history.push('/rlogin');
    return <Container maxWidth='md'>
      <a href="/rlogin">Login required</a>
    </Container>
  }

  const [rname, capability] = (window.localStorage.getItem('rd')||'').split(',');

  const handleTeamChange = (e,newValue) => {
    setTeam(newValue);
  }

  return <Container fullWidth>
     <div style={{
      boxShadow: '0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      borderRadius: '1.5em', padding:'2em'
    }}>
      <Typography variant='h2'>Scoring Sheet</Typography>
      <hr/>
      <Typography variant='h5'>Reviewer: <strong>{rname}</strong></Typography>
      <Typography variant='h5'>Capability: <strong>{capability}</strong></Typography>
      <hr/>
      {!data?<Box>
        <CircularProgress/> Loading...
      </Box>:<Grid container spacing={2}>
        <Grid item sm={8}>
          <Autocomplete
            disablePortal
            id="combo-box-team"
            options={data.map(t=>({label:t.teamid}))}
            sx={{ width: '50ch' }}
            renderInput={(params) => <TextField {...params} label="Team" />}
            value={team}
            onChange={handleTeamChange}
          />
          {/* <FormControl fullWidth>
            <InputLabel id="team-select-label">Team</InputLabel>
            <Select
              labelId="team-select-label"
              id="team-select"
              value={team}
              label="Team"
              onChange={handleTeamChange}
            >
              {data.map((t)=><MenuItem key={t.teamid} value={t.teamid}>{t.teamid}</MenuItem>)}
            </Select>
          </FormControl> */}
          {team?<VerticalLinearStepper capability={capability}/>:<span>Please select a Team</span>}
        </Grid>
        <Grid item sm={4}>

        </Grid>
      </Grid>}
    </div>
  </Container>
}
