const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Crear usuario (pruebas)
// POST http://localhost:3000/usuarios
router.post('/', userController.crearUsuario);

module.exports = router;