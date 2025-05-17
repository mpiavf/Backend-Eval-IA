const userModel = require('../models/userModel');

const crearUsuario = async (req, res) => {
  try {
    const nuevoUsuario = await userModel.crearUsuario(req.body);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Error en creacion usuario' });
  }
};

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await userModel.obtenerUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error en obtener usuarios' });
  }
};

module.exports = {crearUsuario, obtenerUsuarios};