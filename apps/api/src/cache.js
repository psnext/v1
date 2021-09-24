const cacheManager = require('cache-manager');
const redisStore = require('cache-manager-ioredis');

export function initializeCache({config, log}) {
  let cache;
  if (config.redisHost) {
    cache = cacheManager.caching({
      store: redisStore,
      host: config.redisHost,
      port: config.redisPort,
      password: config.redisPassword,
      db: config.redisDB,
      ttl: 600
    });
    // listen for redis connection error event
    var redisClient = cache.store.getClient();

    redisClient.on('connect', ()=>{
      log.info('✔️ REDIS: connected')
    })
    redisClient.on('error', (error) => {
      log.error(`REDIS: ${error}`);
    });
  } else {
    cache = cacheManager.caching({
        store: 'memory',
        ttl: 600
    });
  }
  return cache;
}
