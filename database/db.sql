CREATE TABLE Usuario (
  user_id   SERIAL    PRIMARY KEY,      
  nombre    TEXT      NOT NULL,
  email     TEXT      NOT NULL UNIQUE,
  rol       VARCHAR(20) NOT NULL     -- 'Estudiante' | 'Docente'
);

CREATE TABLE Curso (
  curso_id    SERIAL    PRIMARY KEY,   
  profesor_id INT       NOT NULL,       -- FK → Usuario(user_id)
  nombre      TEXT      NOT NULL,
  sigla       TEXT      NOT NULL,
  semestre    TEXT      NOT NULL,
  CONSTRAINT fk_curso_profesor FOREIGN KEY(profesor_id)
    REFERENCES Usuario(user_id)
);

CREATE TABLE Grupo (
  grupo_id    SERIAL    PRIMARY KEY,    
  curso_id    INT       NOT NULL,       -- FK → Curso(curso_id)
  nombre      TEXT      NOT NULL,       
  CONSTRAINT fk_grupo_curso FOREIGN KEY(curso_id)
    REFERENCES Curso(curso_id)
);

CREATE TABLE Inscripcion (
  curso_id   INT       NOT NULL,        -- FK → Curso(curso_id)
  grupo_id   INT       NOT NULL,        -- FK → Grupo(grupo_id)
  user_id    INT       NOT NULL,        -- FK → Usuario(user_id)
  PRIMARY KEY(curso_id, user_id),
  CONSTRAINT fk_insc_curso   FOREIGN KEY(curso_id) REFERENCES Curso(curso_id),
  CONSTRAINT fk_insc_grupo   FOREIGN KEY(grupo_id) REFERENCES Grupo(grupo_id),
  CONSTRAINT fk_insc_usuario FOREIGN KEY(user_id)   REFERENCES Usuario(user_id)
);

CREATE TABLE Asignacion_Pares (
  asign_id       SERIAL     PRIMARY KEY,          
  curso_id       INT        NOT NULL,                -- FK → Curso(curso_id)
  evaluador_id   INT        NOT NULL,                -- FK → Usuario(user_id)
  evaluado_id    INT        NOT NULL,                -- FK → Usuario(user_id)
  isActive       BOOLEAN    NOT NULL DEFAULT FALSE,  
  CONSTRAINT fk_asig_curso     FOREIGN KEY(curso_id)     REFERENCES Curso(curso_id),
  CONSTRAINT fk_asig_evaluador FOREIGN KEY(evaluador_id) REFERENCES Usuario(user_id),
  CONSTRAINT fk_asig_evaluado  FOREIGN KEY(evaluado_id)  REFERENCES Usuario(user_id),
  UNIQUE(curso_id, evaluador_id, evaluado_id)
);


CREATE TABLE Respuesta (
  respuesta_id   SERIAL     PRIMARY KEY,       
  asign_id       INT        NOT NULL,          -- FK → Asignacion_Pares(asign_id)
  puntuacion     SMALLINT   NOT NULL          
    CHECK (puntuacion BETWEEN 1 AND 7),
  fortalezas     TEXT       NULL,              
  aspectos_dev   TEXT       NULL,              
  enviado_at     TIMESTAMP  NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_resp_asig FOREIGN KEY(asign_id)
    REFERENCES Asignacion_Pares(asign_id)
);
