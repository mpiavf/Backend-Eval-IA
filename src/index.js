const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const docenteRoutes = require('./routes/docenteRoutes');

app.use(express.json());
app.use('/usuarios', userRoutes);
app.use('/api/docente', docenteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo ${PORT}`);
});

