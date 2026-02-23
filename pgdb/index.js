import pkg from 'pg';
import dotenv from 'dotenv';
import { trace } from '../utils/Tracer.js';

// obtain Postgress connection parameters from the environment
const pgenv = dotenv.config({ path: './pgdb/.env-server' });

// console.log(pgenv);
// create a new pool, this supports a higher load of concurrent connections
const { Pool } = pkg;
const pool = new Pool({
    // user: process.env.PGUSER,
    user: pgenv.parsed.PGUSER,
    host: pgenv.parsed.PGHOST,
    database: pgenv.parsed.PGDATABASE,
    password: pgenv.parsed.PGPASSWORD,
    port: pgenv.parsed.PGPORT,
});
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

// the actual function that gets exported
// expects: text - the actual SQL statement, with parameters represented by $1, $2, ...
// params: an array of values that will be substituted when the query gets executed
export const query  = async(text, params) => {
    let result;
    trace(text, 3);
    const client = await pool.connect();
    try {
        result = await client.query(text, params);
    // console.log(result);
    } catch (error) {
        trace(error, 1);
        if (error.status === 23505) {this.rollback;} // duplicate key
        return error;
    }
    finally {
        client.release();
    }
    return result;
};