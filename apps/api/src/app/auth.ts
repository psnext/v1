import express = require('express');
import crypto = require('crypto');
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import qs = require('qs');

const SSID_COOKIE_NAME = 'ssid';

const base64URLEncode = (str) => str.toString('base64')
.replace(/\+/g, '-')
.replace(/\//g, '_')
.replace(/=/g, '');

const sha256 = (buffer) => crypto.createHash('sha256')
.update(buffer)
.digest();

const getDomainRoot = (host)=>{
  const parts=host.split('.');
  if (parts.length<3) return;
  return `${parts[1]}.${parts[2]}`;
}

const getReturnUrl = (rurl:string)=>{
  try {
    if (!rurl.startsWith('http')) {
      return rurl;
    }
    const ru = new URL(rurl);
    // const cu = new URL((req.headers['x-forwarded-proto']||req.protocol) +
    //   "://" + req.headers.host + req.originalUrl);
    const allowedReturnhostnames = process.env.RETURN_HOSTS.split(',');
    if (allowedReturnhostnames.indexOf(ru.hostname.toLocaleLowerCase())!==-1) {
      return rurl;
    }
  } catch(ex) {
    console.error(`error parsing returnUrl: ${ex}`)
  }
  return '/';
}

const loginbycode = async (req, res) => {
  const {log, cache, config} = req.app;
  const {email='',code=''} = req.body;
  const returnUrl = getReturnUrl(req.query.returnUrl||'/');
  const {pool} = req.app.db;
  if (email==='' || code==='') return res.sendStatus(400);
  log.info(`login with code: ${code}`);
  res.clearCookie(SSID_COOKIE_NAME);
  if (req.sessionData) {
    cache.del(req.sessionData.id);
  }

  try {
    let result = await pool.query('SELECT * from user_tokens WHERE token=$1',[`${email.toLocaleLowerCase()}:${code}`]);
    if (result.rowCount===0) {
      return res.sendStatus(400);
    }

    // check of token expiration
    if (result.rows[0].expirytime.getTime()<Date.now()){
      return res.status(403).json({error:'Code expired.'});
    }

    result = await pool.query('SELECT id, email, name, picture FROM users WHERE id = $1',[result.rows[0].id]);
    const dbuser = result.rows[0];
    if (!dbuser) {
      //something wrong user should exist
      log.error('Unable to find user for the code:'+email);
      return res.sendStatus(400);
    }
    //ensure role
    result = await pool.query('SELECT uid,roleid FROM user_roles WHERE uid=$1',[dbuser.id]);
    if (result.rowCount===0){
      await pool.query("INSERT INTO user_roles(uid, roleid) SELECT u.id as uid, r.id as roleid FROM (select id from roles where name='Basic.User') r, (select id from users where email=$1) u;",
        [email.toLocaleLowerCase()]);
    }

    const sessionId = "ac."+base64URLEncode(sha256(uuidv4()));

    res.cookie(SSID_COOKIE_NAME, sessionId, {
      signed: true,
      maxAge: config.sessionTimeout,
      secure: true,
      httpOnly: true,
      domain: getDomainRoot(req.headers.host)
    });
    cache.set(sessionId, {
      id: sessionId,
      expiresAt: Date.now()+(60*60*1)*1000,
      //tokenData,
      userInfo: {
        ...dbuser
      },
      ua: req.headers['user-agent'],
      //token_endpoint: OAuthConfig.token_endpoint,
    }, {ttl: config.sessionTimeout});

    //delete the code
    await pool.query('DELETE FROM user_tokens WHERE token=$1',[`${email.toLocaleLowerCase()}:${code}`])
    return res.json({returnUrl});
  } catch(ex) {
    log.error('Unexpected error in login by code');
    log.error(ex);
    return res.sendStatus(500);
  }
}

const logout = (req, res)=>{
  res.clearCookie(SSID_COOKIE_NAME);
  if (req.sessionData) {
    req.app.cache.del(req.sessionData.id);
    req.sessionData = null;
  }
  const returnUrl = req.query.returnUrl||'/';
  return res.redirect(returnUrl);
}


export const verifySessionTokens = async (req, res, next)=>{
  const {log, cache, config} = req.app;
  const ssid = req.signedCookies[SSID_COOKIE_NAME];
  if (!ssid) {
    log.info(`No Session for path ${req.path}`);
    req.sessionData=null;
    return next();
  }

  try {
    const sessionData = await cache.get(ssid);
    if (!sessionData) {
      console.log(`Invalid session id: ${ssid}`);
      req.sessionData=null;
      res.clearCookie(SSID_COOKIE_NAME);
      return next();
    }

    if (Date.now() < sessionData.expiresAt) {
      req.sessionData = sessionData;
      return next();
    }

    if (sessionData.tokenData) {
      const data = {
        grant_type: 'refresh_token',
        client_id: req.app.config.client_id,
        client_secret: req.app.config.client_secret,
        refresh_token: sessionData.tokenData.refresh_token
      }
      log.debug(`refreshing access_token: ${JSON.stringify(data)}`);
      const tokenResponse = await axios.post(`${sessionData.token_endpoint}`,
        qs.stringify(data));

      if (tokenResponse.status!==200) {
        log.error(`unable to refresh token. ${tokenResponse.data}`);
        cache.del(ssid);
        res.clearCookie(SSID_COOKIE_NAME);
        return next();
      }

      const tokenData = tokenResponse.data;
      if (!tokenData.access_token) {
        log.error(`invalid response on refreshing the token: ${tokenData.data}`);
        req.sessionData=null;
        return next();
      }

      sessionData.tokenData = tokenData;
      sessionData.expiresAt = Date.now() + tokenData.expires_in*1000;
    } else {
      // internal token
      log.info('Refresing session expiration for '+sessionData.userInfo.email)
      sessionData.expiresAt = Date.now() + config.sessionTimeout-3600000;
    }
    res.cookie(SSID_COOKIE_NAME, ssid, {
      signed: true,
      maxAge: config.sessionTimeout,
      secure: true,
      httpOnly: true,
      domain: getDomainRoot(req.headers.host)
    });
    cache.set(ssid, sessionData, {ttl: config.sessionTimeout});
    req.sessionData = sessionData;
    return next();
  } catch(ex) {
    log.error(ex);
    req.sessionData=null;
    return next();
  }
};

export function getAuthRouter() {
  const authRouter = express.Router();

  authRouter.use(verifySessionTokens);
  authRouter.post('/api/auth/loginwithcode', loginbycode);
  authRouter.get('/api/auth/logout', logout);

  return authRouter;
}
