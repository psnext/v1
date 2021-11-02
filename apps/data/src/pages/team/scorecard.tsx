/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { styled } from '@mui/material/styles';
import { Card, CardActions, CardContent, CardHeader, Chip, Collapse, Grid, IconButton, IconButtonProps, ListItemText,MenuItem,Select,Typography } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useUser } from "../../hooks/useUser";
import { useUsersList } from "../../hooks/useUsersList";
import { PopupPanel, MultiSelectList, CircularProgressWithLabel, PopupPieChart, uniqueValues } from "@psni/sharedui";
import * as d3 from "d3";
import { IUser } from "@psni/models";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from "@mui/system";
import * as fns from 'date-fns';
import { useSnapshotDates } from "../../hooks/useSnapshotDates";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

function SelectUsers(props: { users: Array<any>; selected: Array<any>; onChange:any}){
  const {users=[], selected=[], onChange=null} = props;

  const handleDelete=useCallback((u:any)=>{
    const idx = selected.indexOf(u);
    if (idx!==-1) {
      const newlist = [...selected];
      newlist.splice(idx,1);
      onChange(newlist);
    }
  },[selected, onChange]);

  const handleChange = (selected:any)=>{
    onChange(selected);
  }

  return (<PopupPanel buttonContent={<div>
        {selected.map((u:any, i:number)=><Chip key={u?.id||'0'} label={u?.name} onDelete={()=>handleDelete(u)}/>)}
        </div>}>
          <Card sx={{p:2, minWidth:200}}>
            <MultiSelectList
              value={selected}
              options={users}
              getOptionLabel={(o:any)=>o.name}
              getOptionSubLabel={(o:any)=>o.details.title}
              onChange={handleChange}
              itemProps={{sx:{px:0}}}
            />
          </Card>
      </PopupPanel>
  )
}


const db={
  career_stage_list:["Intern", "Junior Associate", "Associate", "Senior Associate", "Manager/Specialist",null, "Sr. Manager/Sr. Specialist", "Director/Expert", "VP/Fellow", "Executive"]
};


function ScoreCardRow({user, onClickUser}:any) {
  const statContainer:any = {marginBottom:'0.5em', display:'flex', flexDirection:'column', alignItems:'center'};
  const stat:any = {minWidth:48, height:54,fontSize:24, display:'flex', alignItems:'center', justifyContent:'center'};
  const {orgCount, directsCount, conCount, maleCount, totCurExp, leverage}=user.summary;
  const contractorRatio=(conCount*100/(orgCount<1?1:orgCount));
  const genderRatio=(maleCount*100/(orgCount<1?1:orgCount));
  const avgCurExp=(totCurExp/(365*(orgCount<1?1:orgCount)));
  const cs = uniqueValues(leverage, db.career_stage_list);

  return (<>
  <Grid container direction="row" justifyContent="flex-start" alignItems="flex-start" style={{marginBottom:'1em'}}>
    <Grid item xs={12} sm={12} md={2} style={{...statContainer, alignItems: 'flex-start'}}>
      <div style={{...stat, alignItems:'flex-start', textAlign:'start', cursor:'pointer'}} onClick={()=>{ onClickUser&&onClickUser(user)}}>
        <ListItemText
          primary={user.name}
          secondary={user.details?.title}/>
      </div>
    </Grid>

    <Grid item xs={3} sm={2} md={1} style={statContainer}>
      <div style={stat}>
        <span className={'MuiTypography-h3'} style={{color:'lightblue'}}>{orgCount}</span>
      </div>
      <Typography variant='caption'>Count</Typography>
    </Grid>

    <Grid item xs={2} md={1} style={statContainer}>
      <div style={{...stat, color: directsCount>10?(
        directsCount>15?'red':'orange'
      ):'green'}}>
        <CircularProgressWithLabel color='inherit'
          value={(directsCount>10?10:directsCount)*10}
          label={directsCount+''}
        />
      </div>
      <Typography variant='caption'>Directs</Typography>
    </Grid>

    <Grid item xs={2} md={1} sx={{...statContainer}}>
      <div style={{...stat}}>
        <PopupPieChart data={cs}
          options={{width:48, height:48}}
          popupOptions={{width:350, height:350, showLabels:true}}/>
      </div>
      <Typography variant='caption'>Leverage</Typography>
    </Grid>

    <Grid item xs={2} md={1} sx={{...statContainer, color:genderRatio>65?(
        genderRatio>80?'red':'orange'
      ):'green'}}>
      <div style={{...stat}}>
        <CircularProgressWithLabel color='inherit'
          value={100-genderRatio}
        />
      </div>
      <Typography variant='caption'>Women</Typography>
    </Grid>

    <Grid item xs={2} md={1} sx={{...statContainer, color:contractorRatio>20?(
        contractorRatio>25?'red':'orange'
      ):'green'}}>
      <div style={{...stat}} >
        <CircularProgressWithLabel color='inherit'
          value={100-contractorRatio}
        />
      </div>
      <Typography variant='caption'>FTE</Typography>
    </Grid>

    <Grid item xs={2} md={1} sx={{...statContainer}}>
      <div style={{...stat}}>
        <span className={'MuiTypography-h1'}>{avgCurExp.toFixed(1)}</span>
      </div>
      <Typography variant='caption'>PS Exp <span style={{color:'red'}}>▼</span> <span style={{color:'green'}}>▲</span></Typography>
    </Grid>

  </Grid>
  <hr style={{borderTop:'0.25px dotted lightgray', marginBottom:'0.5em'}}/>
  </>);
}

export default function ScoreCard({user, users=[]}:{user?:IUser, users?:Array<IUser>}) {
  const [selectedUsers, setSelectedUsers] = useState<Array<any>>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(()=>{
    if (user) {
      setSelectedUsers([user]);
    }
  },[user]);

  const data = useMemo(()=>{
    const clients = d3.group(users, (u:any)=>u.details.client);
    const mgrs = d3.group(users, (u:any)=>u.details.supervisor_oid);
    const maxdate=new Date(1970,0,1);

    function summarize(u:any) {
      u.summary = u.summary||{orgCount:0, directsCount:0, conCount:0, maleCount:0, totCurExp:0, leverage:[]};


      const sdate = fns.parse(u.details.startdate,"yyyy-MM-dd",maxdate);
      u.summary.totCurExp = fns.differenceInDays(Date.now(), sdate);

      u.summary.conCount=u.details.contractor?1:0;
      u.summary.maleCount=u.details.gender==='Male'?1:0;
      const directs = mgrs.get(u.details.oid)||[];
      u.summary.leverage = directs.map(d=>d.details.career_stage);
      u.summary.directsCount = directs.length;
      u.summary.directs = directs;
      u.summary.directs.forEach(summarize);

      u.summary.orgCount=directs.length;
      directs.forEach((d:any)=>{
        u.summary.orgCount+=d.summary.orgCount;
        u.summary.conCount+=d.summary.conCount;
        u.summary.maleCount+=d.summary.maleCount;
        u.summary.totCurExp+=d.summary.totCurExp;
        u.summary.leverage = u.summary.leverage.concat(d.summary.leverage);
      });
    }

    selectedUsers.forEach(summarize);
    return {clients, mgrs}
  },[users, selectedUsers])

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleOnUserClick = (u:IUser) => {
    setSelectedUsers([u]);
  }

  return <Card sx={{p:2}}>
  <CardHeader
    action={
      <IconButton aria-label="settings">
        <MoreVertIcon />
      </IconButton>
    }
    title={<SelectUsers users={users} selected={selectedUsers} onChange={(l:any)=>l.length>0?setSelectedUsers(l):setSelectedUsers([user])}/>}
    subheader={ user?fns.format( fns.parse(user.details.snapshotdate||'','yyyy-MM-dd',new Date()), 'do MMM yy'):null} />

  <CardContent>
    {selectedUsers.map((u:IUser)=>{
      return <ScoreCardRow key={u.id} user={u} data={data}/>
    })}
  </CardContent>

  <CardActions disableSpacing>
    <ExpandMore
      expand={expanded}
      onClick={handleExpandClick}
      aria-expanded={expanded}
      aria-label="show more"
    >
      <ExpandMoreIcon />
    </ExpandMore>

    <Box sx={{marginLeft: 'auto'}}>
      <IconButton aria-label="add to favorites">
        <FavoriteBorderIcon />
      </IconButton>
      <IconButton aria-label="share">
        <ShareIcon />
      </IconButton>
    </Box>
  </CardActions>

  <Collapse in={expanded} timeout="auto" unmountOnExit>
    <CardContent>
    {selectedUsers.map(su=>su.summary.directs.sort((u1:any,u2:any)=>u2.summary.orgCount-u1.summary.orgCount).map((u:IUser)=>{
      return <ScoreCardRow key={u.id} user={u} onClickUser={handleOnUserClick}/>
    }))}
    </CardContent>
  </Collapse>
</Card>
}
