const { Pool } = require('pg');

const pool = new Pool({
  host: 'cash-flow-db.cleo2qu48ata.us-east-2.rds.amazonaws.com',
  port: 5432,
  user: 'dbadmin',
  password: 'Cashflow1234*',
  database: 'cashflow',
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;