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
