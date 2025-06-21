const express = require('express');
const router = express.Router();
//const authMiddleware = require('../middleware/authMiddleware'); // para el autuh0
const docenteController = require('../controllers/docenteController');
const authMiddleware = require('../middleware/testAuth');

// Crear curso
// Endpoint: POST http://localhost:3000/docente/curso
router.post('/curso', authMiddleware, docenteController.crearCurso);

// Ver cursos
// Endpoint: GET http://localhost:3000/docente/cursos
router.get('/cursos', authMiddleware, docenteController.obtenerCursosDelProfesor);

// Poblar un curso con estudiantes (seed de 100)
// POST http://localhost:3000/docente/curso/:cursoId/seed
router.post('/curso/:cursoId/seed', authMiddleware, docenteController.seedEstudiantes);

// Crear grupos automáticos en un curso (de tamaño X)
// POST http://localhost:3000/docente/curso/:cursoId/grupos
router.post('/curso/:cursoId/grupos', authMiddleware, docenteController.crearGrupos);

// Cantidad alumnos del profesor (por profesor)
// GET http://localhost:3000/docente/alumnos/total
router.get('/alumnos/total', authMiddleware, docenteController.contarAlumnosDelProfesor);

// Cantidad alumnos del curso
// GET http://localhost:3000/docente/cursos/alumnos
router.get('/cursos/alumnos', authMiddleware, docenteController.contarAlumnosPorCurso);

// Cantidad de grupos por curso
// GET http://localhost:3000/docente/cursos/grupos
router.get('/cursos/grupos', authMiddleware, docenteController.contarGruposPorCurso);

// Crear evaluacion
// POST http://localhost:3000/docente/curso/:cursoId/evaluacion
router.post('/curso/:cursoId/evaluacion', authMiddleware, docenteController.crearEvaluacion);

// Ver evaluaciones activas de un curso
// GET /docente/curso/:cursoId/evaluaciones/activas
router.get('/curso/:cursoId/evaluaciones/activas', authMiddleware, docenteController.getEvaluacionesActivas);

// Ver todas las evaluaciones (activas o no) de un curso
// GET http://localhost:3000/docente/curso/:cursoId/evaluaciones
router.get('/curso/:cursoId/evaluaciones', authMiddleware, docenteController.getTodasEvaluacionesCurso);

// Ver evaluaciones finalizadas de un curso
// GET http://localhost:3000/docente/curso/:cursoId/evaluaciones/finalizadas
router.get('/curso/:cursoId/evaluaciones/finalizadas', authMiddleware, docenteController.getEvaluacionesFinalizadas);

// Activar 
// PUT http://localhost:3000/docente/evaluacion/:evaluacionId/estado
router.put('/evaluacion/:evaluacionId/estado', authMiddleware, docenteController.cambiarEstadoEvaluacion);

// Cantidad respuestas en una evaluación
router.get('/evaluacion/:evaluacionId/resumen', authMiddleware, docenteController.contarRespuestasTotales);

// Progreso estudiantes
// GET /docente/curso/:cursoId/evaluacion/:evaluacionId/progreso
router.get('/curso/:cursoId/evaluacion/:evaluacionId/progreso', authMiddleware, docenteController.progresoEstudiantesEvaluacion);

// Finalizar evaluación (no puede volver a activarse)
// PUT /docente/evaluacion/:evaluacionId/finalizar
router.put('/evaluacion/:evaluacionId/finalizar', authMiddleware, docenteController.finalizarEvaluacion);

// Cambiar visibilidad del feedback para los estudiantes
// PUT /docente/evaluacion/:evaluacionId/feedback
router.put('/evaluacion/:evaluacionId/feedback', authMiddleware, docenteController.cambiarVisibilidadFeedback);

module.exports = router;