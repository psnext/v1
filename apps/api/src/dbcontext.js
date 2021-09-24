const pg = require('pg');

import {PG_User_Repository, User} from './data';


const initializeData= (app) => {
  const pool = new pg.Pool({ connectionString: app.config.DATACONNSTR});

  return {pool}
}

const setDbContext = (req, _res, next)=>{
  const {pool} = req.app.db;
  const sessionData = req.sessionData;
  if (sessionData) {
    const user = new User({id: sessionData.userInfo.id, email:''});
    const userRepository = new PG_User_Repository(pool, {cache: req.app.cache, context: {user} });
    req.db = {pool, userRepository};
  }
  next();
}
export {initializeData, setDbContext};
