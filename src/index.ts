import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import db from './db';
import bootstrap from './bootstrap';
import { tracker, verifier } from './blockchain';
import routes from './route';

const port = parseInt(process.env.PORT as string, 10) || 4000;
const server = express();
console.log('Starting Wallet Services');
db.connect();

db.connection.once('open', async () => {
  console.log('[MongoDB] Connection has been established');
  await bootstrap();
  tracker();
  verifier();
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());
  server.use('/', routes);

  server.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
});
