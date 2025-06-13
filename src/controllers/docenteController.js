console.log("Controlador docente cargado")
const pool = require('../config/db');


// Crear curso

exports.crearCurso = async (req, res) => {
  const { nombre, sigla, semestre, seccion } = req.body;
  const profesor_id = req.user.user_id; // viene del token/auth middleware

  try {
    const result = await pool.query(
      `INSERT INTO Curso 
        (nombre, sigla, semestre, seccion, profesor_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [nombre, sigla, semestre, seccion, profesor_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Ver cursos profesor

exports.obtenerCursosDelProfesor = async (req, res) => {
  const profesor_id = req.user.user_id; // token decodificado
  try {
    const result = await pool.query(
      `SELECT * FROM Curso WHERE profesor_id = $1 ORDER BY creado_en DESC`,
      [profesor_id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// estudiantes de docente
// total evaluaciones

exports.hacerSeed = async (req, res) => {
  const { cursoId } = req.params;
  try {
    // SIMULAR SEED

    res.status(200).json({ message: 'Seed ejecutado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Poblar estudiantes

exports.seedEstudiantes = async (req, res) => {
  const { cursoId } = req.params;
  const cantidad = 100;

  try {
    const nuevosUsuarios = [];

	// por ahora
    for (let i = 1; i <= cantidad; i++) {
      const nombre = `Estudiante ${i}`;
      const email = `estudiante${i}_curso${cursoId}@demo.com`;

      const usuarioRes = await pool.query(
        `INSERT INTO Usuario (nombre, email, rol)
         VALUES ($1, $2, 'Estudiante')
         RETURNING user_id`,
        [nombre, email]
      );

      const userId = usuarioRes.rows[0].user_id;

      // inscribir al curso (aún sin grupo)
      await pool.query(
        `INSERT INTO Inscripcion (user_id, grupo_id)
         VALUES ($1, NULL)`,
        [userId]
      );
      nuevosUsuarios.push(userId);
    }

    res.status(201).json({
      message: `Se crearon ${cantidad} estudiantes para el curso ${cursoId}`,
      estudiantes: nuevosUsuarios
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear grupos 

exports.crearGrupos = async (req, res) => {
  const { cursoId } = req.params;
  const { tamanoGrupo } = req.body;

  try {
    // obtener ids  los estudiantes en ese curso que aún no tienen grupo
    const estudiantesRes = await pool.query(
      `SELECT i.user_id
       FROM Inscripcion i
       JOIN Usuario u ON i.user_id = u.user_id
       JOIN Grupo g ON i.grupo_id = g.grupo_id
       WHERE g.curso_id = $1`,
      [cursoId]
    );

    const estudiantes = estudiantesRes.rows.map(row => row.user_id);

    if (estudiantes.length === 0) {
      return res.status(400).json({ error: 'No hay estudiantes en este curso' });
    }

    let grupoCount = 0;

    for (let i = 0; i < estudiantes.length; i += tamanoGrupo) {
      const grupoRes = await pool.query(
        `INSERT INTO Grupo (curso_id, nombre) VALUES ($1, $2) RETURNING grupo_id`,
        [cursoId, `Grupo ${++grupoCount}`]
      );

      const grupoId = grupoRes.rows[0].grupo_id;

      const grupoEstudiantes = estudiantes.slice(i, i + tamanoGrupo);

      for (const userId of grupoEstudiantes) {
        await pool.query(
          `UPDATE Inscripcion SET grupo_id = $1 WHERE user_id = $2`,
          [grupoId, userId]
        );
      }
    }
    res.status(201).json({
      message: `Se crearon ${grupoCount} grupos de hasta ${tamanoGrupo} estudiantes`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cantidad alumnos del profesor
exports.contarAlumnosDelProfesor = async (req, res) => {
  const profesor_id = req.user.user_id;

  try {
    const result = await pool.query(
      `
      SELECT COUNT(DISTINCT i.user_id) AS total_alumnos
      FROM Curso c
      JOIN Grupo g ON g.curso_id = c.curso_id
      JOIN Inscripcion i ON i.grupo_id = g.grupo_id
      WHERE c.profesor_id = $1
      `,
      [profesor_id]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cantidad alumnos por curso 

exports.contarAlumnosPorCurso = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT c.curso_id, c.nombre, COUNT(i.user_id) AS cantidad_alumnos
      FROM Curso c
      JOIN Grupo g ON g.curso_id = c.curso_id
      JOIN Inscripcion i ON i.grupo_id = g.grupo_id
      GROUP BY c.curso_id
      ORDER BY c.curso_id
      `
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cantidad de grupos por curso
exports.contarGruposPorCurso = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT curso_id, COUNT(*) AS cantidad_grupos
      FROM Grupo
      GROUP BY curso_id
      ORDER BY curso_id
      `
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear evaluacion

exports.crearEvaluacion = async (req, res) => {
  const { cursoId } = req.params;
  const { nombre } = req.body;

  try {
    // 1. Verificar que el curso tiene grupos
    const gruposRes = await pool.query(
      `SELECT grupo_id FROM Grupo WHERE curso_id = $1`,
      [cursoId]
    );

    if (gruposRes.rowCount === 0) {
      return res.status(400).json({ error: 'El curso no tiene grupos creados.' });
    }
    const grupos = gruposRes.rows;
    // 2. Verificar que hay alumnos en esos grupos
    const alumnosRes = await pool.query(
      `SELECT grupo_id, user_id FROM Inscripcion
       WHERE grupo_id IN (
         SELECT grupo_id FROM Grupo WHERE curso_id = $1
       )`,
      [cursoId]
    );
    if (alumnosRes.rowCount === 0) {
      return res.status(400).json({ error: 'No hay estudiantes inscritos en grupos del curso.' });
    }
    const alumnosPorGrupo = grupos.map(grupo => {
      return {
        grupo_id: grupo.grupo_id,
        estudiantes: alumnosRes.rows
          .filter(a => a.grupo_id === grupo.grupo_id)
          .map(a => a.user_id)
      };
    });

    // 3. Crear la evaluación
    const evaluacionRes = await pool.query(
      `INSERT INTO Evaluacion (curso_id, nombre, activa, cantidad_grupos)
       VALUES ($1, $2, TRUE, $3)
       RETURNING evaluacion_id`,
      [cursoId, nombre, grupos.length]
    );

    const evaluacionId = evaluacionRes.rows[0].evaluacion_id;

    // 4. Crear asignaciones por grupo
    let asignacionesCreadas = 0;

    for (const grupo of alumnosPorGrupo) {
      const estudiantes = grupo.estudiantes;

      for (const evaluador of estudiantes) {
        for (const evaluado of estudiantes) {
          if (evaluador !== evaluado) {
            await pool.query(
              `INSERT INTO Asignacion_Pares
               (evaluacion_id, grupo_id, evaluador_id, evaluado_id, isActive)
               VALUES ($1, $2, $3, $4, TRUE)`,
              [evaluacionId, grupo.grupo_id, evaluador, evaluado]
            );
            asignacionesCreadas++;
          }
        }
      }
    }

    res.status(201).json({
      message: 'Evaluación creada exitosamente',
      evaluacionId,
      asignacionesCreadas
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Estado de evaluacion 
exports.cambiarEstadoEvaluacion = async (req, res) => {
  const { evaluacionId } = req.params;
  const { activa } = req.body; // true o false

  try {
    const result = await pool.query(
      `UPDATE Evaluacion SET activa = $1 WHERE evaluacion_id = $2 RETURNING *`,
      [activa, evaluacionId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }

    res.status(200).json({
      message: `Evaluación ${activa ? 'activada' : 'desactivada'} correctamente`,
      evaluacion: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Respuestas totales por evaluacion
exports.contarRespuestasTotales = async (req, res) => {
  const { evaluacionId } = req.params;

  try {
    const totalAsignacionesRes = await pool.query(
      `SELECT COUNT(*) FROM Asignacion_Pares WHERE evaluacion_id = $1`,
      [evaluacionId]
    );

    const respuestasRes = await pool.query(
      `SELECT COUNT(*) FROM Respuesta r
       JOIN Asignacion_Pares ap ON r.asign_id = ap.asign_id
       WHERE ap.evaluacion_id = $1`,
      [evaluacionId]
    );

    res.status(200).json({
      total_asignaciones: parseInt(totalAsignacionesRes.rows[0].count),
      respuestas_realizadas: parseInt(respuestasRes.rows[0].count),
      completado: parseInt(respuestasRes.rows[0].count) === parseInt(totalAsignacionesRes.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Progreso de estudiante

exports.progresoEstudiantesEvaluacion = async (req, res) => {
  const { cursoId, evaluacionId } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        u.user_id,
        u.nombre,
        COUNT(ap.asign_id) AS total_asignaciones,
        COUNT(r.respuesta_id) AS respuestas_enviadas
      FROM Usuario u
      JOIN Asignacion_Pares ap ON u.user_id = ap.evaluador_id
      LEFT JOIN Respuesta r ON r.asign_id = ap.asign_id
      WHERE ap.evaluacion_id = $1
        AND u.user_id IN (
          SELECT i.user_id
          FROM Inscripcion i
          JOIN Grupo g ON i.grupo_id = g.grupo_id
          WHERE g.curso_id = $2
        )
      GROUP BY u.user_id, u.nombre
      ORDER BY u.nombre
    `, [evaluacionId, cursoId]);

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/// FALTAS


//exports.generarFeedback = async (req, res) => {
  // logica de generación de feedback 
  //res.json({ message: 'Feedback generado exitosamente (simulado)' });
//};

//exports.verFeedback = async (req, res) => {
  // Retornar feedback simulado para cada alumno
 // res.json([
   // { user_id: 1, feedback: 'Buen trabajo colaborativo' },
   // { user_id: 2, feedback: 'Mejorar participación en clase' }
  ///]);
///};