import knex from 'knex';
import { env } from '../config/env';

const isProd = env.NODE_ENV === 'production';

export const db = knex({
  client: 'pg',
  connection: isProd
    ? { connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  migrations: {
    directory: `${__dirname}/migrations`,
    loadExtensions: ['.ts', '.js'],
  },
});
