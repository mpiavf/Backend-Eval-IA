CREATE TABLE Usuario (
  user_id   SERIAL    PRIMARY KEY,      
  nombre    TEXT      NOT NULL,
  email     TEXT      NOT NULL UNIQUE,
  rol       VARCHAR(20) NOT NULL CHECK (rol IN ('Estudiante', 'Docente')),
  auth0_id    TEXT UNIQUE
);

CREATE TABLE Curso (
  curso_id    SERIAL    PRIMARY KEY,   
  profesor_id INT       NOT NULL,       
  nombre      TEXT      NOT NULL,
  sigla       TEXT      NOT NULL,
  semestre    INT NOT NULL CHECK (semestre IN (1, 2)),
  seccion     INT       NOT NULL,
  anio        INT       NOT NULL,
  cantidad_alumnos      INT DEFAULT 0,
  evaluaciones_activas  INT DEFAULT 0,
  cantidad_grupos       INT DEFAULT 0,
  creado_en             TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_curso_profesor FOREIGN KEY(profesor_id)
    REFERENCES Usuario(user_id)
);

CREATE TABLE Grupo (
  grupo_id    SERIAL    PRIMARY KEY,    
  curso_id    INT       NOT NULL,     
  nombre      TEXT      NOT NULL,       
  CONSTRAINT fk_grupo_curso FOREIGN KEY(curso_id)
    REFERENCES Curso(curso_id)
);

CREATE TABLE Inscripcion (
  user_id   INT NOT NULL,
  curso_id  INT NOT NULL,
  grupo_id  INT,  -- opcional
  PRIMARY KEY(user_id, curso_id),
  CONSTRAINT fk_insc_usuario FOREIGN KEY(user_id) REFERENCES Usuario(user_id),
  CONSTRAINT fk_insc_curso   FOREIGN KEY(curso_id) REFERENCES Curso(curso_id),
  CONSTRAINT fk_insc_grupo   FOREIGN KEY(grupo_id) REFERENCES Grupo(grupo_id)
);

--  Una evaluación activa del curso X que tiene N grupos, y donde los estudiantes deben evaluarse entre sí
CREATE TABLE Evaluacion (
  evaluacion_id    SERIAL PRIMARY KEY,
  curso_id         INT NOT NULL,
  nombre           TEXT NOT NULL,
  activa           BOOLEAN DEFAULT FALSE,
  finalizada       BOOLEAN DEFAULT FALSE,
  feedback_visible BOOLEAN DEFAULT FALSE,  
  cantidad_grupos  INT DEFAULT 0,
  completadas      INT DEFAULT 0,
  creada_en        TIMESTAMP DEFAULT NOW(),
  fecha_limite     TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),

  CONSTRAINT fk_eval_curso FOREIGN KEY (curso_id)
    REFERENCES Curso(curso_id)
);

CREATE TABLE Asignacion_Pares (
  asign_id       SERIAL PRIMARY KEY,
  evaluacion_id  INT NOT NULL, 
  grupo_id       INT                   ,         
  evaluador_id   INT        NOT NULL,                
  evaluado_id    INT        NOT NULL,                
  isActive       BOOLEAN    NOT NULL DEFAULT FALSE,  
  CONSTRAINT fk_asig_eval       FOREIGN KEY (evaluacion_id) REFERENCES Evaluacion(evaluacion_id),
  CONSTRAINT fk_asig_grupo      FOREIGN KEY (grupo_id) REFERENCES Grupo(grupo_id),
  CONSTRAINT fk_asig_evaluador  FOREIGN KEY (evaluador_id) REFERENCES Usuario(user_id),
  CONSTRAINT fk_asig_evaluado   FOREIGN KEY (evaluado_id)  REFERENCES Usuario(user_id),
  UNIQUE (evaluacion_id, evaluador_id, evaluado_id)
);


CREATE TABLE Respuesta (
  respuesta_id   SERIAL     PRIMARY KEY,       
  asign_id       INT        NOT NULL,          
  puntuacion     SMALLINT   NOT NULL          
    CHECK (puntuacion BETWEEN 1 AND 7),
  fortalezas     TEXT       NULL,              
  aspectos_dev   TEXT       NULL,
  feedback_ia    TEXT       NULL,               
  enviado_at     TIMESTAMP  NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_resp_asig FOREIGN KEY(asign_id)
    REFERENCES Asignacion_Pares(asign_id)
);
