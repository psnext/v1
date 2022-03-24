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
})


export default hackApiRouter;
