import tls from 'node:tls';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { HTTPS_PORT } from '../config.js';
import { parseRequest, handleRequest, serialize } from './utils.js';

const certPath = process.env.CERT_PATH ?? join(process.cwd(), 'cert.pem');
const keyPath = process.env.KEY_PATH ?? join(process.cwd(), 'key.pem');

const cert = readFileSync(certPath, 'utf8');
const key = readFileSync(keyPath, 'utf8');

tls.createServer({ cert, key }, (socket) => {
  let buf = '';

  socket.on('data', (chunk) => {
    buf += chunk.toString('latin1');
    const req = parseRequest(buf);
    if (!req) return;

    socket.write(serialize(handleRequest(req)));
    socket.end();
  });

  socket.on('error', () => {});
}).listen(HTTPS_PORT, () => {
  console.log(`HTTPS server is running on ${HTTPS_PORT}`);
});