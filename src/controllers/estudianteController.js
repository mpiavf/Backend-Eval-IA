const pool = require('../config/db');

// Ver cursos del estudiante
exports.obtenerCursosDelEstudiante = async (req, res) => {
  const estudiante_id = req.user.user_id;

  try {
    const result = await pool.query(
      `
      SELECT c.*
      FROM Inscripcion i
      JOIN Curso c ON i.curso_id = c.curso_id
      WHERE i.user_id = $1
      ORDER BY c.creado_en DESC
      `,
      [estudiante_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// inscribirse a un curso como etudiante
exports.inscribirseACurso = async (req, res) => {
  const user_id = req.user.user_id;
  const { curso_id } = req.body;

  try {
    // Verificar que el curso existe
    const curso = await pool.query(
      `SELECT * FROM Curso WHERE curso_id = $1`,
      [curso_id]
    );

    if (curso.rowCount === 0) {
      return res.status(404).json({ error: 'El curso no existe' });
    }

    // Registrar inscripción (grupo_id NULL por defecto)
    await pool.query(
      `INSERT INTO Inscripcion (user_id, curso_id)
       VALUES ($1, $2)`,
      [user_id, curso_id]
    );

	await pool.query(
  `UPDATE Curso
   SET cantidad_alumnos = (
     SELECT COUNT(*) FROM Inscripcion WHERE curso_id = $1
   )
   WHERE curso_id = $1`,
  [curso_id]
);

    res.status(201).json({ message: 'Inscripción realizada exitosamente' });
  } catch (err) {
    if (err.code === '23505') {
      // clave duplicada: ya está inscrito
      res.status(409).json({ error: 'Ya estás inscrito en este curso' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};


// Ver grupo y curso del estudiante 

exports.verGrupoYCurso = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const result = await pool.query(
      `
      SELECT 
        g.nombre AS grupo_nombre,
        c.nombre AS curso_nombre,
        c.sigla,
        c.semestre,
        c.anio
      FROM Inscripcion i
      JOIN Grupo g ON i.grupo_id = g.grupo_id
      JOIN Curso c ON i.curso_id = c.curso_id
      WHERE i.user_id = $1
      `,
      [user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No estás asignado a ningún grupo' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Ver todas las evaluaciones (finalizadas o no)
exports.getTodasEvaluaciones = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const result = await pool.query(`
      SELECT 
        ap.asign_id,
        c.nombre AS curso_nombre,
        e.nombre AS evaluacion_nombre,
        e.evaluacion_id,
        g.nombre AS grupo_nombre,
        ap.evaluado_id,
        u.nombre AS evaluado_nombre,
        e.creada_en,
        e.finalizada,
        r.respuesta_id IS NOT NULL AS respondido
      FROM Asignacion_Pares ap
      JOIN Evaluacion e ON ap.evaluacion_id = e.evaluacion_id
      JOIN Curso c ON e.curso_id = c.curso_id
      JOIN Grupo g ON ap.grupo_id = g.grupo_id
      JOIN Usuario u ON ap.evaluado_id = u.user_id
      LEFT JOIN Respuesta r ON ap.asign_id = r.asign_id
      WHERE ap.evaluador_id = $1
        AND e.activa = true
      ORDER BY e.creada_en DESC
    `, [user_id]);

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Evaluaciones completadas  (solo si están activadas)
exports.getEvaluacionesCompletadas = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const result = await pool.query(`
      SELECT 
        ap.asign_id,
        c.nombre AS curso_nombre,
        e.nombre AS evaluacion_nombre,
        e.evaluacion_id,
        g.nombre AS grupo_nombre,
        ap.evaluado_id,
        u.nombre AS evaluado_nombre,
        e.creada_en,
        e.finalizada,
        r.enviado_at AS fecha_respuesta
      FROM Asignacion_Pares ap
      JOIN Evaluacion e ON ap.evaluacion_id = e.evaluacion_id
      JOIN Curso c ON e.curso_id = c.curso_id
      JOIN Grupo g ON ap.grupo_id = g.grupo_id
      JOIN Usuario u ON ap.evaluado_id = u.user_id
      JOIN Respuesta r ON ap.asign_id = r.asign_id
      WHERE ap.evaluador_id = $1
        AND e.activa = true
      ORDER BY r.enviado_at DESC
    `, [user_id]);

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Ver evaluaciones pendientes del estudiante (solo activas y no finalizadas)
exports.getEvaluacionesPendientes = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const result = await pool.query(`
      SELECT 
        ap.asign_id,
        c.nombre AS curso_nombre,
        e.nombre AS evaluacion_nombre,
        e.evaluacion_id,
        g.nombre AS grupo_nombre,
        ap.evaluado_id,
        u.nombre AS evaluado_nombre,
        e.creada_en,
        r.respuesta_id IS NOT NULL AS respondido
      FROM Asignacion_Pares ap
      JOIN Evaluacion e ON ap.evaluacion_id = e.evaluacion_id
      JOIN Curso c ON e.curso_id = c.curso_id
      JOIN Grupo g ON ap.grupo_id = g.grupo_id
      JOIN Usuario u ON ap.evaluado_id = u.user_id
      LEFT JOIN Respuesta r ON ap.asign_id = r.asign_id
      WHERE ap.evaluador_id = $1
        AND ap.isActive = true
        AND r.respuesta_id IS NULL
        AND e.activa = true
        AND e.finalizada = false
      ORDER BY e.creada_en DESC
    `, [user_id]);

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear la respuesta 
exports.responderEvaluacion = async (req, res) => {
  const { asignId } = req.params;
  const { puntuacion, fortalezas, aspectos_dev } = req.body;
  const evaluador_id = req.user.user_id; // desde el middleware 

  try {
    // 1. Verificar que la asignación existe y es válida para este usuario
    const asignacion = await pool.query(
      `SELECT * FROM Asignacion_Pares WHERE asign_id = $1 AND evaluador_id = $2 AND isActive = TRUE`,
      [asignId, evaluador_id]
    );

    if (asignacion.rowCount === 0) {
      return res.status(403).json({ error: 'No tienes acceso o la evaluación no está activa' });
    }

    // 2. Validar que no haya una respuesta ya
    const existe = await pool.query(
      `SELECT * FROM Respuesta WHERE asign_id = $1`,
      [asignId]
    );

    if (existe.rowCount > 0) {
      return res.status(409).json({ error: 'Ya respondiste esta evaluación' });
    }

    // 3. Insertar la respuesta
    const result = await pool.query(
      `INSERT INTO Respuesta (asign_id, puntuacion, fortalezas, aspectos_dev)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [asignId, puntuacion, fortalezas, aspectos_dev]
    );

    res.status(201).json({ message: 'Respuesta registrada', respuesta: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Ver feedback recibido por el estudiante
exports.getFeedbackRecibido = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Obtener todas las puntuaciones y posibles feedback_ia
    const result = await pool.query(`
      SELECT 
        e.nombre AS evaluacion_nombre,
        c.nombre AS curso_nombre,
        r.puntuacion,
        r.feedback_ia
      FROM Respuesta r
      JOIN Asignacion_Pares ap ON r.asign_id = ap.asign_id
      JOIN Evaluacion e ON ap.evaluacion_id = e.evaluacion_id
      JOIN Curso c ON e.curso_id = c.curso_id
      WHERE ap.evaluado_id = $1
        AND e.feedback_visible = true
    `, [user_id]);

    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }

    // Agrupar por evaluación
    const agrupado = {};

    for (const row of result.rows) {
      const key = `${row.evaluacion_nombre}||${row.curso_nombre}`;

      if (!agrupado[key]) {
        agrupado[key] = {
          evaluacion_nombre: row.evaluacion_nombre,
          curso_nombre: row.curso_nombre,
          puntuaciones: [],
          feedbacks_ia: []
        };
      }

      agrupado[key].puntuaciones.push(row.puntuacion);
      if (row.feedback_ia) {
        agrupado[key].feedbacks_ia.push(row.feedback_ia);
      }
    }

    // Preparar respuesta
    const feedbackFinal = Object.values(agrupado).map(fb => {
      const promedio = (
        fb.puntuaciones.reduce((acc, val) => acc + val, 0) / fb.puntuaciones.length
      ).toFixed(2);

      return {
        curso_nombre: fb.curso_nombre,
        evaluacion_nombre: fb.evaluacion_nombre,
        nota_promedio: promedio,
        feedback_ia: fb.feedbacks_ia.length > 0 ? fb.feedbacks_ia.join('\n') : null
      };
    });

    res.status(200).json(feedbackFinal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};