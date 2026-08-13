import Fastify from 'fastify';
import pg from 'pg';

const app = Fastify({ logger: false });
const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : null;

app.get('/health', async () => ({ status: 'ok' }));

app.get('/users', async () => {
  if (!pool) {
    return { users: [], note: 'DATABASE_URL not configured' };
  }

  const result = await pool.query('SELECT NOW() as now');
  return { users: [{ id: 1, name: 'demo-user' }], database: result.rows[0] };
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, async () => {
    await app.close();
    await pool?.end();
    process.exit(0);
  });
}

await app.listen({ port: 3000, host: '0.0.0.0' });
console.log('Server listening on 0.0.0.0:3000');
