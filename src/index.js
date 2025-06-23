const express = require('express');
const app = express();
const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const docenteRoutes = require('./routes/docenteRoutes');
const estudianteRoutes = require('./routes/estudianteRoutes');

app.use(express.json());

app.use('/usuarios', userRoutes);
app.use('/docente', docenteRoutes);
app.use('/estudiante', estudianteRoutes);
app.use('/debug', require('./routes/debugRoutes'));


app.get('/', (req, res) => {
  res.send('Servidor funcionando ✔️');
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    console.error('Error en /health:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/init', async (req, res) => {
  try {
    const sqlPath = path.join(__dirname, '..', 'database', 'db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    res.json({ status: 'ok', message: 'Base de datos inicializada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo ${PORT}`);
});

