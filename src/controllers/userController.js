const pool = require('../config/db');

// Para pruebas

// Crear usuarios
exports.crearUsuario = async (req, res) => {
  const { nombre, email, rol } = req.body;

  if (!nombre || !email || !rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Usuario (nombre, email, rol)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, email, rol]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};