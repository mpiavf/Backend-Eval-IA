const express = require('express');
const app = express();

const userRoutes = require('./routes/userRoutes');
const docenteRoutes = require('./routes/docenteRoutes');
const estudianteRoutes = require('./routes/estudianteRoutes');

app.use(express.json());

app.use('/usuarios', userRoutes);
app.use('/docente', docenteRoutes);
app.use('/estudiante', estudianteRoutes);


app.get('/', (req, res) => {
  res.send('Servidor funcionando ✔️');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo ${PORT}`);
});

