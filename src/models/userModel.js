const pool = require('../config/db');

const crearUsuario = async ({ nombre, correo, contrasena, rol }) => {
  const res = await pool.query(
    `INSERT INTO usuarios (nombre, correo, contrasena, rol)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [nombre, correo, contrasena, rol]
  );
  return res.rows[0];
};

const obtenerUsuarios = async () => {
  const res = await pool.query(`SELECT id, nombre, correo, rol FROM usuarios`);
  return res.rows;
};

module.exports = {
  crearUsuario,
  obtenerUsuarios
};