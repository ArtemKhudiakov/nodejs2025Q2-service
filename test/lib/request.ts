import 'dotenv/config';
const request = require('supertest');

const port = process.env.PORT || 4000;

const host = `http://localhost:${port}`;
const _request = request(host);

export default _request;
