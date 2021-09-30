import app from './app/app.js';
import { join } from 'path';
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


;(async ()=>{
  const port = process.env.port || 3333;
  const server = app.listen(port, async () => {
    // check db connection
    try{
      const client = await app.db.pool.connect();
      try {
        const res = await client.query('SELECT NOW();');
        app.log.info(`✔️ DB connected at ${res.rows[0].now}`);
      } finally {
        client.release()
      }
    } catch(err) {
      app.log.error(err.stack);
    };
    app.log.info(`✔️ PSNext v1 API server Listening at ${port}`);
  });

  server.on('error', console.error);
  function onSIGHUP(signal: string) {
    console.log(`*^!@4=> Received event: ${signal}`);

  }

  function closeGracefully(signal: string) {
    console.log(`*^!@4=> Received event: ${signal}`);
    app.db||app.db.pool.end();
    server.close(async ()=>{
      process.exit();
    });
  }

  process.on('SIGHUP', onSIGHUP);
  process.on('SIGINT', closeGracefully);
  process.on('SIGTERM', closeGracefully);
})().catch(err => console.log(err.stack))
