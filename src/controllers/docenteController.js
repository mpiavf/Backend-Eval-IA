const pool = require('../config/db');

// Crear curso
exports.crearCurso = async (req, res) => {
  const { nombre, sigla, semestre, seccion, anio } = req.body;
  const profesor_id = req.user.user_id; // viene del token/auth middleware

  try {
    const result = await pool.query(
      `INSERT INTO Curso 
        (nombre, sigla, semestre, seccion, anio, profesor_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [nombre, sigla, semestre, seccion, anio, profesor_id]
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
			`INSERT INTO Inscripcion (user_id, curso_id)
			VALUES ($1, $2)`,
			[userId, cursoId]
		)
      nuevosUsuarios.push(userId);
    }
	await pool.query(
  `UPDATE Curso
   SET cantidad_alumnos = (
     SELECT COUNT(*) FROM Inscripcion WHERE curso_id = $1
   )
   WHERE curso_id = $1`,
  [cursoId]
);

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

  if (!tamanoGrupo || tamanoGrupo <= 0) {
    return res.status(400).json({ error: 'Tamaño de grupo debe ser un número positivo' });
  }

  try {
    const estudiantesRes = await pool.query(
      `SELECT user_id
       FROM Inscripcion
       WHERE curso_id = $1 AND grupo_id IS NULL`,
      [cursoId]
    );

    const estudiantes = estudiantesRes.rows.map(row => row.user_id);

    if (estudiantes.length === 0) {
      return res.status(400).json({ error: 'No hay estudiantes sin grupo en este curso' });
    }

    const totalEstudiantes = estudiantes.length;
    const baseGrupoCount = Math.floor(totalEstudiantes / tamanoGrupo);
    const extraEstudiantes = totalEstudiantes % tamanoGrupo;

    let grupoCount = 0;
    let index = 0;

    const gruposResumen = [];

    for (let i = 0; i < baseGrupoCount; i++) {
      const size = tamanoGrupo + (i < extraEstudiantes ? 1 : 0); // Distribuir extras
      const grupoNombre = `Grupo ${++grupoCount}`;

      const grupoRes = await pool.query(
        `INSERT INTO Grupo (curso_id, nombre) VALUES ($1, $2) RETURNING grupo_id`,
        [cursoId, grupoNombre]
      );

      const grupoId = grupoRes.rows[0].grupo_id;
      const grupoEstudiantes = estudiantes.slice(index, index + size);

      for (const userId of grupoEstudiantes) {
        await pool.query(
          `UPDATE Inscripcion
           SET grupo_id = $1
           WHERE user_id = $2 AND curso_id = $3`,
          [grupoId, userId, cursoId]
        );
      }

      gruposResumen.push({ grupoNombre, grupoId, cantidad: grupoEstudiantes.length });
      index += size;
    }

    res.status(201).json({
      message: `Se crearon ${grupoCount} grupos distribuyendo ${totalEstudiantes} estudiantes`,
      grupos: gruposResumen
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
      JOIN Inscripcion i ON i.curso_id = c.curso_id
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
  const profesor_id = req.user.user_id;

  try {
    const result = await pool.query(
      `
      SELECT c.curso_id, c.nombre, COUNT(i.user_id) AS cantidad_alumnos
      FROM Curso c
      LEFT JOIN Inscripcion i ON i.curso_id = c.curso_id
      WHERE c.profesor_id = $1
      GROUP BY c.curso_id
      ORDER BY c.curso_id
      `,
      [profesor_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cantidad de grupos por curso
exports.contarGruposPorCurso = async (req, res) => {
  const profesor_id = req.user.user_id;

  try {
    const result = await pool.query(
      `
      SELECT c.curso_id, c.nombre, COUNT(g.grupo_id) AS cantidad_grupos
      FROM Curso c
      JOIN Grupo g ON g.curso_id = c.curso_id
      WHERE c.profesor_id = $1
      GROUP BY c.curso_id
      ORDER BY c.curso_id;
      `,
      [profesor_id] 
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear evaluacion (inactiva por defecto)

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

    // 3. Crear
    const evaluacionRes = await pool.query(
      `INSERT INTO Evaluacion (curso_id, nombre, activa, cantidad_grupos)
       VALUES ($1, $2, False, $3)
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

// Ver todas las evaluaciones (activas o no) de un curso
exports.getTodasEvaluacionesCurso = async (req, res) => {
  const { cursoId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM Evaluacion
       WHERE curso_id = $1
       ORDER BY creada_en DESC`,
      [cursoId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ver evaluaciones activas de un curso
exports.getEvaluacionesActivas = async (req, res) => {
  const { cursoId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM Evaluacion
       WHERE curso_id = $1 AND activa = TRUE
       ORDER BY creada_en DESC`,
      [cursoId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ver evaluaciones finalizadas de un curso
exports.getEvaluacionesFinalizadas = async (req, res) => {
  const { cursoId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM Evaluacion
       WHERE curso_id = $1 AND finalizada = TRUE
       ORDER BY creada_en DESC`,
      [cursoId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Cambiar estado de evaluacion (solo se puede activar una vez)
exports.cambiarEstadoEvaluacion = async (req, res) => {
  const { evaluacionId } = req.params;
  const { activa } = req.body;
  try {
    // 1. Obtener el estado actual
    const evaluacion = await pool.query(
      `SELECT activa, finalizada, fecha_limite FROM Evaluacion WHERE evaluacion_id = $1`,
      [evaluacionId]
    );
    if (evaluacion.rowCount === 0) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }
    const { activa: actualActiva, finalizada, fecha_limite } = evaluacion.rows[0];
    if (finalizada) {
      return res.status(400).json({ error: 'La evaluación ya fue finalizada y no se puede modificar.' });
    }
    // Validar activación por primera vez
    if (!actualActiva && activa === true) {
      // Actualizar activa y fecha_limite
      const result = await pool.query(
        `UPDATE Evaluacion
         SET activa = true,
             fecha_limite = NOW() + INTERVAL '7 days'
         WHERE evaluacion_id = $1
         RETURNING *`,
        [evaluacionId]
      );

      await pool.query(
        `UPDATE Asignacion_Pares SET isActive = true WHERE evaluacion_id = $1`,
        [evaluacionId]
      );

      return res.status(200).json({
        message: 'Evaluación activada correctamente',
        evaluacion: result.rows[0]
      });
    }
    // Si se quiere desactivar
    if (actualActiva && activa === false) {
      const result = await pool.query(
        `UPDATE Evaluacion SET activa = false WHERE evaluacion_id = $1 RETURNING *`,
        [evaluacionId]
      );

      await pool.query(
        `UPDATE Asignacion_Pares SET isActive = false WHERE evaluacion_id = $1`,
        [evaluacionId]
      );

      return res.status(200).json({
        message: 'Evaluación desactivada correctamente',
        evaluacion: result.rows[0]
      });
    }
    return res.status(400).json({ error: 'No se puede reactivar una evaluación ya activada anteriormente.' });
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

	const total = parseInt(totalAsignacionesRes.rows[0].count);
    const respondidas = parseInt(respuestasRes.rows[0].count);
    const porcentaje = total > 0 ? ((respondidas / total) * 100).toFixed(2) : '0.00';

    res.status(200).json({
      total_asignaciones: total,
      respuestas_realizadas: respondidas,
      porcentaje_avance: `${porcentaje}%`,
      completado: respondidas === total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Progreso de estudiante por grupo

exports.progresoEstudiantesEvaluacion = async (req, res) => {
  const { cursoId, evaluacionId } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        g.nombre AS grupo,
        u.user_id,
        u.nombre,
        COUNT(ap.asign_id) AS total_asignaciones,
        COUNT(r.respuesta_id) AS respuestas_enviadas
      FROM Usuario u
      JOIN Inscripcion i ON u.user_id = i.user_id
      JOIN Grupo g ON i.grupo_id = g.grupo_id
      JOIN Asignacion_Pares ap ON u.user_id = ap.evaluador_id AND ap.grupo_id = g.grupo_id
      LEFT JOIN Respuesta r ON r.asign_id = ap.asign_id
      WHERE ap.evaluacion_id = $1 AND g.curso_id = $2
      GROUP BY g.nombre, u.user_id, u.nombre
      ORDER BY g.nombre, u.nombre
    `, [evaluacionId, cursoId]);

    // Agrupar por grupo
    const agrupado = {};

    result.rows.forEach(row => {
      const grupo = row.grupo;
      if (!agrupado[grupo]) agrupado[grupo] = [];

      const total = parseInt(row.total_asignaciones);
      const hechas = parseInt(row.respuestas_enviadas);
      const porcentaje = total > 0 ? ((hechas / total) * 100).toFixed(2) : '0.00';

      agrupado[grupo].push({
        user_id: row.user_id,
        nombre: row.nombre,
        total_asignaciones: total,
        respuestas_enviadas: hechas,
        porcentaje_avance: `${porcentaje}%`
      });
    });

    res.status(200).json(agrupado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Finalizar la evaluacion:  (ya no puede volver a activarse)

exports.finalizarEvaluacion = async (req, res) => {
  const { evaluacionId } = req.params;

  try {
    const evaluacion = await pool.query(
      `SELECT * FROM Evaluacion WHERE evaluacion_id = $1`,
      [evaluacionId]
    );

    if (evaluacion.rowCount === 0) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }

    if (evaluacion.rows[0].finalizada) {
      return res.status(400).json({ error: 'La evaluación ya está finalizada' });
    }

    // Desactivar la evaluación y marcar como finalizada
    await pool.query(
      `UPDATE Evaluacion 
       SET activa = false, finalizada = true 
       WHERE evaluacion_id = $1`,
      [evaluacionId]
    );

    // Desactivar todas las asignaciones
    await pool.query(
      `UPDATE Asignacion_Pares 
       SET isActive = false 
       WHERE evaluacion_id = $1`,
      [evaluacionId]
    );

    res.status(200).json({ message: 'Evaluación finalizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// boton para permitir mostrar el feedback a los alumnos
exports.cambiarVisibilidadFeedback = async (req, res) => {
  const { evaluacionId } = req.params;
  const { visible } = req.body;

  try {
    // Verificar que la evaluación exista y esté finalizada
    const evaluacion = await pool.query(
      `SELECT finalizada FROM Evaluacion WHERE evaluacion_id = $1`,
      [evaluacionId]
    );

    if (evaluacion.rowCount === 0) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }

    if (!evaluacion.rows[0].finalizada) {
      return res.status(400).json({
        error: 'La evaluación no ha sido finalizada. No se puede habilitar feedback aún.'
      });
    }

    // Actualizar visibilidad del feedback
    const result = await pool.query(
      `UPDATE Evaluacion SET feedback_visible = $1 WHERE evaluacion_id = $2 RETURNING *`,
      [visible, evaluacionId]
    );

    res.status(200).json({
      message: `Feedback ${visible ? 'habilitado' : 'oculto'} correctamente`,
      evaluacion: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
