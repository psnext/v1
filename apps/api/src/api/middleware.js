
export function requireSession(req, res, next){
  if (!req.sessionData) {
    return res.status(401).send();
  }
  next();
}

export function requirePermission(permissions, oid) {
  return async (req, res, next)=>{
    const {log} = req.app;
    if (!req.sessionData) {
      return res.sendStatus(401);
    }
    const userId = req.sessionData.userInfo.id;
    const userRepo = req.db.userRepository;
    try {
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
