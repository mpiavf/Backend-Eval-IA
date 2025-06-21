const express = require('express');
const router = express.Router();
//const authMiddleware = require('../middleware/authMiddleware'); // para el autuh0
const estudianteController = require('../controllers/estudianteController');
const authMiddleware = require('../middleware/testAuthEstudiante');


// Ver cursos 
// GET http://localhost:3000/estudiante/cursos
router.get('/cursos', authMiddleware, estudianteController.obtenerCursosDelEstudiante);

// Inscribir cursos (para pruebas)
// POST http://localhost:3000/estudiante/inscripcion
router.post('/inscribirse', authMiddleware, estudianteController.inscribirseACurso);

// Ver grupos de sus cursos 
// GET http://localhost:3000/estudiante/grupo
router.get('/grupo', authMiddleware, estudianteController.verGrupoYCurso);

// Ver evaluaciones de pares 
// GET http://localhost:3000/estudiante/evaluaciones
router.get('/evaluaciones', authMiddleware, estudianteController.getTodasEvaluaciones);

// Ver evaluaciones completadas
// GET http://localhost:3000/estudiante/evaluaciones/completadas
router.get('/evaluaciones/completadas', authMiddleware, estudianteController.getEvaluacionesCompletadas);

// Ver evaluaciones de pares pendientes
// GET http://localhost:3000/alumno/evaluaciones/pendientes
router.get('/evaluaciones/pendientes', authMiddleware, estudianteController.getEvaluacionesPendientes);

// Responder evaluación
// POST /estudiante/evaluacion/:asignacionId/responder
router.post('/evaluacion/:asignId/responder', authMiddleware, estudianteController.responderEvaluacion);

// Ver el feedback
// GET /estudiante/feedback
router.get('/feedback', authMiddleware, estudianteController.getFeedbackRecibido);

module.exports = router;