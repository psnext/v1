import { Box } from "@mui/material";
import React from 'react';

function format(x) {
  return Number.parseFloat(x).toFixed(2);
}

export default function Bar({score, maxscore}){
  return <Box sx={{position:'relative', height:'2em', width:'100%', borderColor:'lightgray', borderWidth:1, borderStyle:'solid'}}>
    <Box sx={{position:'absolute', top:0, left:0,bottom:0,
      width:`100%`,
      clipPath: `inset(0 calc(100% - ${parseFloat(score+'')*100/(maxscore||1)}%) 0 0)`,
      background: 'linear-gradient(90deg, rgba(255,145,145,1) 0%, rgba(255,255,145,1) 50%, rgba(145,255,145,1) 100%)'
    }}>
    </Box>
    <Box sx={{position:'absolute', top:0, left:0, bottom:0, margin:'4px', backgroundColor:'#ffffff99'}}>
      {format(score+'')}
    </Box>
  </Box>
}
