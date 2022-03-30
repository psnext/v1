import * as express from 'express';
import * as fns from 'date-fns'
import axios from 'axios';
import * as multer from 'multer';
import * as Excel from 'exceljs';
import {User} from '../data';
import * as crypto from 'crypto';
import { requirePermission, requireSession } from './middleware';

var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
const hackApiRouter = express.Router();


hackApiRouter.post('/start', async (req, res, next)=>{
  const {log} = req.app;
  const {pool} = req.app.db;
  const {teamid, teamcode} = req.body;

  console.log({teamid, teamcode});

  if (!teamid || !teamcode) return res.status(400).send({error:'Invalid teamid or teamcode'});

  if (teamid.toLowerCase()==='test' && teamcode==='1234') {
    return res.send({starttime:new Date()});
  }
  try {
    let result = await pool.query(`SELECT teamcode, starttime FROM ahteams WHERE teamid=$1`,[teamid]);
    if (result.rowCount===0){
      console.log(`No teamid: ${teamid}`);
      return res.status(400).send({error:'Invalid teamid or teamcode'});
    }
    console.log(result.rows[0]);
    if (result.rows[0].teamcode!==teamcode) {
      return res.status(400).send({error:'Invalid teamid or teamcode'});
    }

    if (result.rows[0].starttime===null) {
      result = await pool.query(`UPDATE ahteams SET starttime=$1 WHERE teamid=$2 returning starttime`,[new Date(), teamid]);
    }

    return res.send({starttime:result.rows[0].starttime});

  } catch(ex) {
    console.error(`exception for ${teamid} - ${teamcode}`);
    console.error(ex);
    return res.status(500).send({error:'Server error. Please try again'});
  }
})


hackApiRouter.get('/rscore', async (req, res, next)=>{
  const {log} = req.app;
  const {pool} = req.app.db;

  const email = (req.query['email']||'').toLowerCase();
  try {
    let result;
    if (email==='') {
      result = await pool.query(`SELECT * from ahteamsscores`);
    } else {
      result = await pool.query(`SELECT * from ahteamsscores WHERE remail=$1`,[email]);
    }
    return res.send(result.rows);
  } catch (ex) {
    console.error(ex);
    return res.sendStatus(500);
  }
});

hackApiRouter.post('/rscore', async (req, res, next)=>{
  const {log} = req.app;
  const {pool} = req.app.db;
  const {teamid, email, capability, problemstatement, scoredetails, comments} = req.body;

  let score=0;
  Object.keys(scoredetails).forEach((k)=>score+=scoredetails[k]);

  console.log({teamid, email, capability, scoredetails, comments, score, problemstatement});

  if (!teamid || !email || !capability || !scoredetails) return res.status(400).send({error:'Invalid score'});

  try {
    const result = await pool.query(`SELECT teamid from ahteamsscores where teamid=$1 AND remail=$2`, [teamid, email]);
    if (result.rowCount===0) {
      log.info('New score');
      await pool.query(`INSERT into ahteamsscores(teamid, remail, capability, score, scoredetails, comments, problemstatement)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,[
        teamid, email, capability, score, scoredetails, comments, problemstatement
      ]);
    } else {
      await pool.query(`UPDATE ahteamsscores set capability=$1, score=$2, scoredetails=$3, comments=$4, problemstatement=$5 where teamid=$6 AND remail=$7`,[
        capability, score, scoredetails, comments, problemstatement,
        teamid, email
      ]);
    }

    return res.sendStatus(200);
  } catch(ex) {
    console.error(ex);
    return res.status(500).send({error:'Server error. Please try again'});
  }
});

hackApiRouter.get('/data', async (req, res, next)=>{
  const {log} = req.app;
  const {pool} = req.app.db;

  try {
    const result = await pool.query(`SELECT teamid, starttime, endtime from ahteams where endtime IS NOT NULL order by starttime asc`);
    return res.send(result.rows);
  } catch (ex) {
    console.error(ex);
    return res.sendStatus(500);
  }
});

export default hackApiRouter;
