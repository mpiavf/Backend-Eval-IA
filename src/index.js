const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const docenteRoutes = require('./routes/docenteRoutes');




app.use(express.json());

console.log('Cargando rutas de docente...');
app.use('/docente', docenteRoutes);
console.log('Rutas de docente cargadas');
//app.use('/usuarios', userRoutes);



// ✅ Mueve esto arriba de app.listen
app.get('/', (req, res) => {
  res.send('Servidor funcionando ✔️');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Error no atrapado:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Promesa no manejada:', reason);
});

