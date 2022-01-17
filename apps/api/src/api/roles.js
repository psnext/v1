import * as express from 'express';

import { requirePermission, requireSession } from './middleware';

const rolesApiRouter = express.Router();

rolesApiRouter.get('/',requirePermission(['Roles.Read.All']),async (req, res)=>{
  const {log} = req.app;
  const {pool} = req.app.db;

  try {
    const dbresults = await pool.query('SELECT * FROM roles');
    return res.send(dbresults.rows);
  } catch (error) {
    log.error('Unable to list roles');
    log.error(error);
    res.status(500).json({error:'Unable to list roles. Please try again.'});
  }
})

export default rolesApiRouter;
