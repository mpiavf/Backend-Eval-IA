const { Pool } = require('pg');

const pool = new Pool({
  user: 'usuario', // aun no pruebo esta parte
  host: 'localhost',
  database: 'eval_ia',
  password: '123456',
  port: 5432,
});

module.exports = pool;