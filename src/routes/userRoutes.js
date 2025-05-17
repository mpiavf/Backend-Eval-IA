const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.crearUsuario);
router.get('/', userController.obtenerUsuarios);

module.exports = router;