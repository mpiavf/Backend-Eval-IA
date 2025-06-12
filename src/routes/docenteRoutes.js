const express = require('express');
const router = express.Router();
const docenteController = require('../controllers/docenteController');

// Crear curso
router.post('/courses', docenteController.crearCurso);

// Hacer seed (grupos + estudiantes + asignaciones de pares)
router.post('/courses/:cursoId/seed', docenteController.hacerSeed);

// Obtener cursos del docente
router.get('/courses', docenteController.obtenerCursos);

// Activar asignación de pares
router.patch('/assignments/:asignId', docenteController.activarAsignacion);

// Generar feedback IA
router.post('/courses/:cursoId/feedback/generate', docenteController.generarFeedback);

// Obtener feedback generado
router.get('/courses/:cursoId/feedback', docenteController.verFeedback);

module.exports = router;