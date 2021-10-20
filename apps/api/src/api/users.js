import * as express from 'express';
import * as fns from 'date-fns'
import axios from 'axios';
import * as multer from 'multer';
import * as Excel from 'exceljs';
import {User} from '../data';
import * as crypto from 'crypto';

var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
const userApiRouter = express.Router();

const requireSession=(req, res, next)=>{
  if (!req.sessionData) {
    return res.status(401).send();
  }
  next();
}

const requirePermission=function(permissions) {
  return async (req, res, next)=>{
    const {log} = req.app;
    if (!req.sessionData) {
      return res.sendStatus(401);
    }
    const userId = req.sessionData.userInfo.id;
    const userRepo = req.db.userRepository;
    try {
      // const user = await req.db.userRepository.findById(userId);
      const uperms = await userRepo.getPermissions(userId);
      for (let i=0;i<uperms.length;++i) {
        const perm=uperms[i];
        if (permissions.indexOf(perm.name)!=-1){
          log.debug('matched '+perm.name);
          return next();
        }
      };
      return res.sendStatus(403);
    } catch (ex) {
      log.error(ex);
    }
    next();
  }
}

async function* getUserValues(jobid, cache, log, date, worksheet, headers) {
  let i = 2;
  while (i < worksheet.rowCount) {
    const row = worksheet.getRow(i);
    // if (headers.STATUS>0) {
    //   const status = headers.STATUS<0?'':row.getCell(headers.STATUS).value;
    //   if (status!=='Active' && status!=='Active Contingent Assignment'){
    //     i++;
    //     continue;
    //   }
    // }

    const firstname = (headers.FIRST_NAME<0?null:row.getCell(headers.FIRST_NAME).value)||'';
    const middlename = (headers.MIDDLE_NAME<0?null:row.getCell(headers.MIDDLE_NAME).value)||'';
    const lastname = (headers.LAST_NAME<0?null:row.getCell(headers.LAST_NAME).value)||'';
    const name = firstname.trim()+' '+middlename.trim()+' '+lastname.trim();
    const email = (headers.EMAIL_ADDRESS<0?null:row.getCell(headers.EMAIL_ADDRESS).value)||'';
    const details={snapshotdate: fns.format(date,'yyyy-MM-dd')};
    if (headers.GENDER!==-1) {
      details.gender = row.getCell(headers.GENDER).value;
    }
    if (headers.PERSONTYPE!==-1 && row.getCell(headers.PERSONTYPE).value==='Contractor'){
      details.contractor=true;
    } else {
      details.contractor=false;
    }
    if (headers.ORACLE_ID!==-1) {
      details.oid = row.getCell(headers.ORACLE_ID).value;
    }
    if (headers.CLIENT_NAME!==-1) {
      details.client = (headers.CLIENT_NAME<0?null:row.getCell(headers.CLIENT_NAME).value)||'';
    }

    if (headers.HRMS_TEAM_LEVEL2!==-1) {
      details.capability = (headers.HRMS_TEAM_LEVEL2<0?null:row.getCell(headers.HRMS_TEAM_LEVEL2).value)||'';
    }

    if (headers.TEAM_NAME!==-1) {
      details.team = row.getCell(headers.TEAM_NAME).value;
    }

    if (headers.SUPERVISOR!==-1){
      let sparts = row.getCell(headers.SUPERVISOR).value;
      if (sparts) {
        sparts = sparts.split('(');
        details.supervisor_oid = parseInt(sparts[1]);
        details.supervisor_name=sparts[0].split(',').reverse()
          .map(s=>s.trim())
          .filter(s=>s!=='')
          .join(' ');
      }
    }
    if (headers.TITLE_NAME!==-1) {
      details.title = row.getCell(headers.TITLE_NAME).value;
    }
    if (headers.CAREER_STAGE!==-1) {
      details.career_stage = row.getCell(headers.CAREER_STAGE).value;
    }
    if (headers.STARTDATE!==-1) {
      details.startdate = fns.format(row.getCell(headers.STARTDATE).value,'yyyy-MM-dd');
    }
    if (headers.LASTPROMODATE!==-1) {
      try{
        const lpd = row.getCell(headers.LASTPROMODATE).value;
        if (lpd){
          details.lastpromodate = fns.format(lpd,'yyyy-MM-dd');
        }
      }catch(err) {
        log.error(err);
        log.debug(row.getCell(headers.LASTPROMODATE).value);
      }
    }
    i++;
    cache.set(jobid,{jobid, status:'processing', completed: i, total: worksheet.rowCount-1});
    if (i%100===0){
      log.info(JSON.stringify({jobid, status:'processing', completed: i, total: worksheet.rowCount-1}));
    }
    yield {name, email:email.toLowerCase(), details};
  }
  //calculate summaries

  log.debug(`finished job: ${jobid}`);
  cache.set(jobid,{status:'done', completed: i, total: worksheet.rowCount-1})
}

userApiRouter.post('/upload', requirePermission(['Users.Write.All']), upload.single('usersdata'), async (req, res)=>{
  const {log, cache} = req.app;
  const {pool} = req.app.db;
  const userRepo = req.db.userRepository;
  const date = fns.parseISO(req.query.date);

  let jobid;
  try {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet('Base Data');
    if (!worksheet) {
      return res.status(400).json({error:'The file should contain "Base Data" sheet.'})
    }

    log.debug(`File contains: ${worksheet.rowCount} rows`);
    const headerRow = worksheet.getRow(1);

    log.debug(`Data elements: ${headerRow.values.join(',')}`);

    const headers={};
    headers.STATUS      = headerRow.values.indexOf('STATUS');
    headers.PERSONTYPE  = headerRow.values.indexOf('PERSONTYPE');
    headers.FIRST_NAME  = headerRow.values.indexOf('FIRST_NAME');
    headers.MIDDLE_NAME = headerRow.values.indexOf('MIDDLE_NAME');
    headers.LAST_NAME   = headerRow.values.indexOf('LAST_NAME');
    headers.EMAIL_ADDRESS = headerRow.values.indexOf('EMAIL_ADDRESS');
    headers.GENDER      = headerRow.values.indexOf('GENDER');
    headers.SUPERVISOR  = headerRow.values.indexOf('SUPERVISOR');
    headers.CLIENT_NAME = headerRow.values.indexOf('CLIENT_NAME');
    headers.HRMS_TEAM_LEVEL2 = headerRow.values.indexOf('HRMS_TEAM_LEVEL2');
    headers.ORACLE_ID   = headerRow.values.indexOf('ORACLE_ID');
    headers.TITLE_NAME  = headerRow.values.indexOf('TITLE_NAME');
    headers.CAREER_STAGE = headerRow.values.indexOf('CAREER_STAGE');
    headers.STARTDATE   = headerRow.values.indexOf('STARTDATE');
    headers.LASTPROMODATE = headerRow.values.indexOf('LAST_PROMOTION_DATE');
    headers.TEAM_NAME   = headerRow.values.indexOf('TEAM_NAME');
    // const CAREER_STAGE = headerRow.values.indexOf('CAREER_STAGE');
    if (headers.EMAIL_ADDRESS<0) {
      return res.status(400).json({error:'The file should contain "EMAIL_ADDRESS" column.'})
    }
    jobid=crypto.randomUUID();
    log.info('Created upload job:'+jobid);
    cache.set(jobid,{jobid, status:'processing', completed:0, total: worksheet.rowCount-1 })
    res.json({jobid});
    for await(const values of getUserValues(jobid, cache, log, date, worksheet, headers)) {
      try {
        pool.query('INSERT INTO clients (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [values.details.client]);
        const matches = await pool.query('SELECT id, name, email, picture, details from users WHERE lower(email) LIKE $1',
          [values.email]);
        const user = (matches.rowCount>0) ?
          new User(matches.rows[0]) :
          await userRepo.create(values.email);

        console.log(values);
        user.name = values.name;
        if (user.details.snapshotdate) {
          const lastuploaddate = fns.parseISO(user.details.snapshotdate);
          if (!fns.isAfter(lastuploaddate, date)) {
            user.details = {...user.details, ...values.details};
          }
        } else {
          user.details = {...user.details, ...values.details};
        }
        await userRepo.update(user);
        console.log(user.id);

        let hr = await pool.query('SELECT id, snapshotdate, details from users_history WHERE id=$1 AND snapshotdate=$2', [user.id, values.details.snapshotdate]);
        if (hr.rowCount===0) {
          console.log(`updating user ${user.email}`);
          hr=await pool.query('INSERT INTO users_history(id, snapshotdate) VALUES($1,$2) RETURNING id,snapshotdate,details', [user.id, values.details.snapshotdate]);
        } else {
          console.log(`${hr.rows[0].id} - ${hr.rows[0].snapshotdate}`)
        }

        const hdetails={...hr.rows[0].details,...values.details};
        await pool.query('UPDATE users_history SET details=$3 WHERE id=$1 AND snapshotdate=$2',
          [user.id, hdetails.snapshotdate, hdetails]);
      } catch (err) {
        log.error(err);
      }
    }
  } catch (ex) {
    log.error(ex);
    if (!jobid) {
      return res.sendStatus(400);
    }
    cache.set(jobid,{status:'error', error:ex});
  }
});

userApiRouter.get('/snapshotdates', async (req, res)=>{
  const {log} = req.app;
  const {pool} = req.app.db;
  try {
    const results= await pool.query(`SELECT snapshotdate, COUNT(id) FROM users_history GROUP BY snapshotdate  ORDER BY snapshotdate DESC;`);
    return res.json(results.rows);
  } catch (err) {
    log.error(err);
    return res.status(500).send({message:'Unable to fetch the snapshotdates'});
  }
});

// userApiRouter.get('/me', requireSession, async (req, res)=>{
//   const userId = req.sessionData.userInfo.id;
//   const user = await req.db.userRepository.findById(userId);
//   return res.json(user.toJSON());
// });

//userApiRouter.get('/:id', requirePermission(['Users.Read.Self', 'Users.Read.All']), async (req, res)=>{
userApiRouter.get('/:id', requireSession, async (req, res)=>{
  const {log} = req.app;
  const {pool} = req.app.db;
  const userId = req.params.id==='me'?req.sessionData.userInfo.id:req.params.id;
  const userRepo = req.db.userRepository;
  console.log({userId});
  try {
    const uperms = await userRepo.getPermissions(userId);
    //const user = await req.db.userRepository.findById(userId);
    if (req.params.id!=='me' && req.params.id!==req.sessionData.userInfo.id){
      if (uperms.find(p=>p.name==='Users.Read.All')===null){
        return res.sendStatus(403);
      }
      log.debug('matched Users.Read.All');
    }
    const results = await pool.query(`
      WITH RECURSIVE subordinates AS (
        SELECT id,name,email,picture,details,CONCAT(name,'') as sh, CONCAT(id,'') as shid
        FROM users
        WHERE id = $1
        UNION
          SELECT e.id,e.name,e.email, e.picture,e.details, CONCAT(e.name,'>',s.sh) as sh, CONCAT(e.id,'>',s.shid) as shid
          FROM users e
          INNER JOIN subordinates s ON s.details->'supervisor_oid' = e.details->'oid'
      ) SELECT * FROM subordinates
      WHERE id=$1`,
    [userId]);
    const u = results.rows[0]

    return res.json({
      id: u.id,
      name: u.name,
      email: u.email,
      picture: u.picture,
      details: u.details,
      sh:u.sh?u.sh.split('>'):undefined,
      shid:u.shid?u.shid.split('>'):undefined
    });
  }catch (ex) {
    log.error(ex);
    return res.sendStatus(500);
  }
});

userApiRouter.get('/:id/photo', requireSession, async (req, res)=>{
  const {log} = req.app;
  try {
    const result = await axios.get('https://graph.microsoft.com/v1.0/me/photo/$value', {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': req.sessionData.ua,
        'Authorization':`Bearer ${req.sessionData.tokenData.access_token}`,
        'Accept': req.headers['accept']
      }
    });

    if (result.status!==200) {
      log.error(result.status);
      log.error(result.data);
      return res.status(500).send({error:'Unknown error'});
    }

    res.set('Cache-control', `public, max-age=${60*60}`);
    res.set('content-type', result.headers['content-type']);
    return res.send(result.data);
  } catch (ex) {
    log.error(ex);
    return res.status(500).send({error:'Unknown error'});
  }
});


userApiRouter.get('/:id/roles', requirePermission(['UserRoles.Read.Self','UserRoles.Read.All']), async (req, res)=>{
  const {log} = req.app;
  const userId = req.params.id==='me'?req.sessionData.userInfo.id:req.params.id;
  try {
    const roles = await req.db.userRepository.getRoles(userId);
    return res.json(roles.map(r=>r.toJSON()));
  } catch (err) {
    log.error(err);
    return res.status(500).send({message:'Unable to fetch the roles for the user'});
  }
});

userApiRouter.get('/:id/permissions', requireSession, async (req, res)=>{
  const {log} = req.app;
  const userId = req.params.id==='me'?req.sessionData.userInfo.id:req.params.id;
  const userRepo = req.db.userRepository;
  try {
    const uperms = await userRepo.getPermissions(userId);
    let match = uperms.find(u=>u.name==='UserRoles.Read.All');
    if (!match && userId===req.sessionData.userInfo.id){
      match = uperms.find(u=>u.name==='UserRoles.Read.Self');
      if (!match) return res.sendStatus(403);
      roles = await req.db.userRepository.getRoles(userId);
    }
    return res.json(uperms.map(p=>p.toJSON()));
  } catch (err) {
    log.error(err);
    return res.status(500).send({message:'Unable to fetch the permissions for the user'});
  }
});


userApiRouter.get('/', requireSession, async (req, res)=>{
  const {log} = req.app;
  const {pool} = req.app.db;
  const userId = req.sessionData.userInfo.id;
  const userRepo = req.db.userRepository;

  // const user = userRepo.findById(userId);
  const uperms = await userRepo.getPermissions(userId);

  let results= await pool.query(`SELECT id, name, email, picture, details from users WHERE id=$1`, [userId]);

  const user = results.rows[0];
  const {name='', email='', limit=100000, offset=0,date=user.details.snapshotdate} = req.query;

  console.debug({name, email, limit, offset, date});

  if (uperms.find(p=>p.name==='Users.Read.All')){
    log.debug('matched Users.Read.All');
    results = await pool.query(`SELECT * FROM users
      WHERE name ILIKE $3 AND email LIKE $4 AND TO_DATE(details->>'snapshotdate','YYYY-MM-DD')=TO_DATE($5,'YYYY-MM-DD')
      ORDER BY name LIMIT $1 OFFSET $2`,
      [limit, offset, `%${name}%`, `%${email}%`,date]);
  }
  else if (uperms.find(p=>p.name==='Users.Read.Custom')) {
    log.debug('matched Users.Read.Custom');
    results = await pool.query(`
      SELECT * from users_custom_permissions
      WHERE uid=$1 AND permission='Users.Read.Custom'
    `,[userId]);
    if (results.rowCount===0) {
      log.warn('No custom permissions found');
      return res.json([]);
    }
    const condition=results.rows.map(r=>` (${r.condition}) `).join('AND');
    results = await pool.query(`SELECT * FROM users
      WHERE name ILIKE $3 AND email LIKE $4 AND TO_DATE(details->>'snapshotdate','YYYY-MM-DD')=TO_DATE($5,'YYYY-MM-DD') AND (${condition})
      ORDER BY name LIMIT $1 OFFSET $2`,
      [limit, offset, `%${name}%`, `%${email}%`, date]);
  }
  else if (uperms.find(p=>p.name==='Users.Read.Directs')) {
    log.debug('matched Users.Read.Directs');
    results = await pool.query(`
      WITH RECURSIVE subordinates AS (
        SELECT id,name,email,picture,details,CONCAT(name,'') as sh, CONCAT(details->'supervisor_oid','') as shid
        FROM users
        WHERE id = $5
        UNION
          SELECT e.id,e.name,e.email, e.picture,e.details, CONCAT(e.name,'>',s.sh) as sh, CONCAT(e.details->'supervisor_oid','>',s.shid) as shid
          FROM users e
          INNER JOIN subordinates s ON s.details->'oid' = e.details->'supervisor_oid'
      ) SELECT * FROM subordinates
      WHERE name ILIKE $3 AND email LIKE $4 AND TO_DATE(details->>'snapshotdate','YYYY-MM-DD')=TO_DATE($6,'YYYY-MM-DD')
      ORDER BY name LIMIT $1 OFFSET $2;`,
    [limit, offset, `%${name}%`, `%${email}%`, userId, date]);
  }
  else {
    return res.sendStatus(403);
  }
  // const results = await req.db.userRepository.findByName(name, limit, offset);
  const users=[];
  console.log(results.rowCount);
  results.rows.forEach(u => {
    users.push({
      id: u.id,
      name: u.name,
      email: u.email,
      details: u.details,
      sh:u.sh?u.sh.split('>'):undefined,
      shid:u.shid?u.shid.split('>'):undefined
    })
  });
  return res.json(users);
});

function generateCODE(count) {

  // Declare a digits variable
  // which stores all digits
  var digits = '0123456789';
  let CODE = '';
  for (let i = 0; i < count; i++ ) {
      CODE += digits[Math.floor(Math.random() * 10)];
  }
  return CODE;
}

userApiRouter.post('/requestaccess', async (req, res)=>{
  const {email=''} = req.body;
  const {log} = req.app;
  const {pool} = req.app.db;

  const emailParts = email.toLocaleLowerCase().split('@');

  if (emailParts<2) {
    console.warn(req.body);
    return res.status(400).json({error:'Invalid email'});
  }
  if (emailParts[1]!=='publicissapient.com') return res.status(400).json({error:'Invalid email domain.'});

  try {
    let result = await pool.query(`SELECT id FROM users WHERE email=$1`,[email]);
    if (result.rowCount===0) {
      // return res.status(400).json({error:'Unknown user.'});
      result = await pool.query(`INSERT INTO users(email) VALUES($1) RETURNING *`, [email]);
    }

    const code=generateCODE(6);
    result = await pool.query(`INSERT INTO user_tokens(id, tokentype, token) VALUES ($1,$2,$3) RETURNING *`, [result.rows[0].id, 'EMAILVERIFYCODE', `${email}:${code}`]);

    //send mail
    const msg = {
      to: email,
      from: `"psnext.info" <${process.env.MAIL_FROM}>`,
      subject: 'Access code for psnext.info',
      text: `Your PS Next access code is ${code}`,
      html: `Your <strong>PS Next</strong> access code is <h3>${code}</h3>`,
    }
    if (process.env.SKIP_MAIL){
      log.debug('skipped mail', msg);
      return res.status(200).json({code});
    }

    let info = await req.app.mailer.sendMail(msg);
    log.debug("Message sent: %s", info.messageId);

    return res.sendStatus(200);
  } catch(ex) {
    log.error('Unalbe to request access for user: '+email);
    log.error(ex);
    res.status(500).json({error:'Unable to register. Please try again.'});
  }

});

export default userApiRouter;
