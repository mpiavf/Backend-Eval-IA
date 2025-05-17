CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  rol TEXT CHECK (rol IN ('estudiante', 'ayudante', 'profesor')) NOT NULL,
  contrasena TEXT NOT NULL,
  creado_en TIMESTAMP DEFAULT NOW()
);