const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const auth    = require('../middleware/testAuth');   // o quítalo si no quieres auth

// DELETE /debug/reset
router.delete('/reset', auth, async (_req, res) => {
  try {
    await pool.query('BEGIN');
    // Orden import-ante: primero tablas hijas, luego padres
    await pool.query(`
      TRUNCATE TABLE
        inscripcion,
        asignacion_pares,
        respuesta,
        evaluacion,
        grupo,
        curso
      RESTART IDENTITY CASCADE;
      
      -- si quieres borrar TODOS los usuarios, profesor incluido:
      DELETE FROM usuario;
    `);
    await pool.query('COMMIT');
    res.json({ status: 'ok', message: 'BD limpia, contadores a 0' });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
