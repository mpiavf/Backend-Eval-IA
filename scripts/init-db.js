const fs = require('fs');
const pool = require('../src/config/db');

const sql = fs.readFileSync('database/db.sql', 'utf8');

pool.query(sql)
  .then(() => {
    console.log('Base de datos inicializada');
    process.exit();
  })
  .catch(err => {
    console.error('Error al inicializar la base de datos:', err);
    process.exit(1);
  });
