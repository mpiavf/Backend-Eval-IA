const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');


app.use(express.json());
app.use('/usuarios', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo ${PORT}`);
});