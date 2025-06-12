const pool = require('../config/db');

exports.crearCurso = async (req, res) => {
  const { nombre, sigla, semestre, profesor_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Curso (nombre, sigla, semestre, profesor_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, sigla, semestre, profesor_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.hacerSeed = async (req, res) => {
  const { cursoId } = req.params;
  try {
    // SIMULAR SEED

    res.status(200).json({ message: 'Seed ejecutado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerCursos = async (req, res) => {
  const { profesor_id } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM Curso WHERE profesor_id = $1',
      [profesor_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.activarAsignacion = async (req, res) => {
  const { asignId } = req.params;
  const { isActive } = req.body;
  try {
    await pool.query(
      'UPDATE Asignacion_Pares SET isActive = $1 WHERE asign_id = $2',
      [isActive, asignId]
    );
    res.status(200).json({ message: 'Asignación actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generarFeedback = async (req, res) => {
  // logica de generación de feedback 
  res.json({ message: 'Feedback generado exitosamente (simulado)' });
};

exports.verFeedback = async (req, res) => {
  // Retornar feedback simulado para cada alumno
  res.json([
    { user_id: 1, feedback: 'Buen trabajo colaborativo' },
    { user_id: 2, feedback: 'Mejorar participación en clase' }
  ]);
};