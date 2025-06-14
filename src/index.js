const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const docenteRoutes = require('./routes/docenteRoutes');


app.use(express.json());

app.use('/docente', docenteRoutes);
//app.use('/usuarios', userRoutes);


app.get('/', (req, res) => {
  res.send('Servidor funcionando ✔️');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo ${PORT}`);
});

