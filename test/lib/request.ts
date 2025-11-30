import 'dotenv/config';
import * as request from 'supertest';

const port = process.env.PORT || 4000;

const host = `http://localhost:${port}`;
const _request = request(host);

export default _request;
