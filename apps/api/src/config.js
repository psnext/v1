const config = {
    PORT: process.env.PORT || 3333,
    cookieSecret: process.env.COOKIE_SECRET,
    sessionTimeout: process.env.SESSION_TIMEOUT||(7*24*60*60*1000),


    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    redisPassword: process.env.REDIS_PASSWORD,
    redisDB: process.env.REDIS_DB,

    DATACONNSTR: process.env.DATACONNSTR
};

export default config;
