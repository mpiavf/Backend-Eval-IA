# Backend-Eval-IA





## Pruebas locales

### Preparación de la Base de Datos (PostgreSQL)

#### 1. Ingresar a PostgreSQL como superusuario

```
bash
sudo -u postgres psql
```
Para ver las bases de datos:

```
\l
```

#### 2. Crear base de datos

```
CREATE DATABASE evaluacion_pares;
\q
```
#### 3. Cargar las tablas del archivo db.sql

Desde la raíz del proyecto (donde está la carpeta database/) ejecutar: 

```
sudo -u postgres psql -d evaluacion_pares -f database/db.sql
```
Esto crea todas las tablas necesarias. 

#### 4. Comandos útiles

Conectarse a la base de datos:

```
\c evaluacion_pares
```

Ver las tablas de la base de datos: 

```
\dt
```

### Simulacion usuario autenticado

Estando conectado en la base de datos evaluacion_pares, ejecutar: 

```
-- Crear usuario Docente
INSERT INTO Usuario (nombre, email, rol)
VALUES ('Docente Demo', 'docente@demo.com', 'Docente');

-- Crear usuario Estudiante
INSERT INTO Usuario (nombre, email, rol)
VALUES ('Estudiante Demo', 'estudiante@demo.com', 'Estudiante');
```

Esto funciona para los middlewares de autenticación de prueba.
Para simular autenticación como docente, se usa testAuth.js.
Para simular autenticación como estudiante, se usa testAuthEstudiante.js.

### Correr el Backend

En la raiz del proyecto correr 
```
node src/index.js
```

#### Endpoints habilitados: 

##### Docente

1. Crear curso

```
POST /docente/curso
```
Crea un nuevo curso. El user_id del docente se toma desde el middleware de autenticación.

Body JSON:
```
{
  "nombre": "Nombre del curso",
  "sigla": "SIG101",
  "semestre": 1,
  "seccion": 1,
  "anio": 2025
}
```
2. Ver cursos del profesor

```
GET /docente/cursos
```
Retorna todos los cursos creados por el profesor autenticado.

3. Poblar curso con estudiantes
```
POST /docente/curso/:cursoId/seed
```
Crea 100 estudiantes y los inscribe en el curso indicado.

4. Crear grupos automáticos
```
POST /docente/curso/:cursoId/grupos
```
Agrupa automáticamente a los estudiantes inscritos en grupos del tamaño indicado.

Body JSON:
```
{
  "tamanoGrupo": 6
}
```
5. Cantidad total de alumnos del profesor
```
GET /docente/alumnos/total
```
Devuelve el número total de estudiantes asociados a todos los cursos del docente autenticado.

6. Cantidad de alumnos por curso
```
GET /docente/cursos/alumnos
```
Lista los cursos con el conteo de estudiantes por cada uno.

7. Cantidad de grupos por curso
```
GET /docente/cursos/grupos
```
Lista los cursos del docente con la cantidad de grupos creados en cada uno.

8. Crear evaluación
```
POST /docente/curso/:cursoId/evaluacion
```
Crea una evaluación con asignaciones de pares automáticas para todos los grupos del curso. Por defecto, queda desactivada.

Body JSON:
```
{
  "nombre": "Evaluación Parcial 1"
}
```
9. Ver evaluaciones activas de un curso
```
GET /docente/curso/:cursoId/evaluaciones/activas
```
Devuelve solo las evaluaciones activas del curso.
10. Ver todas las evaluaciones (activas o no)  de un curso
```
GET /docente/curso/:cursoId/evaluaciones
```
Devuelve todas las evaluaciones (activas o no) del curso.
11. Ver evaluaciones finalizadas de un curso
```
GET /docente/curso/:cursoId/evaluaciones/finalizadas
```
Devuelve todas las evaluaciones finalizadas del curso.

12. Activar evaluación
```
PUT /docente/evaluacion/:evaluacionId/estado
```
Se activa la evaluacion, solo se puede hacer una vez.

Body JSON:
```
{
  "activa": true
}
```
13. Contar respuestas en una evaluación
```
GET /docente/evaluacion/:evaluacionId/resumen
```
Devuelve cuántas respuestas han sido registradas y el porcentaje de avance.

14. Progreso por estudiante en una evaluación (agrupado por grupo)
```
GET /docente/curso/:cursoId/evaluacion/:evaluacionId/progreso
```
Devuelve por grupo el avance de cada estudiante evaluador en la evaluación (número de respuestas enviadas respecto al total que debe hacer). 

15. Finalizar evaluación (no puede volver a activarse)
```
PUT /docente/evaluacion/:evaluacionId/finalizar

```
Marca la evaluación como finalizada y desactiva las asignaciones.
Una vez finalizada, no se puede volver a activar.

16. Cambiar visibilidad del feedback para los estudiantes
```
PUT /docente/evaluacion/:evaluacionId/finalizar

```
Habilita u oculta el feedback para los estudiantes, solo si la evaluación ya está finalizada.
Body JSON:
```
{
  "visible": true
}
```
##### Estudiante

1. Ver cursos en los que está inscrito

```
GET /estudiante/cursos
```
Devuelve todos los cursos en los que el estudiante autenticado está inscrito.

2. Inscribirse a un curso (para pruebas)

```
POST /estudiante/inscribirse
```
Permite que el estudiante se inscriba a un curso. 


Body JSON:
```
{
  "cursoId": 1
}
```

3. Ver grupo al que pertenece
```
GET /estudiante/grupo
```
Devuelve el grupo y curso asociado al estudiante.

4. Ver todas las evaluaciones asignadas
```
GET /estudiante/evaluaciones
```
Lista todas las evaluaciones asignadas al estudiante (activas o no), marcando si ya respondió cada una.

5. Ver evaluaciones pendientes
```
GET /estudiante/evaluaciones/pendientes
```
Devuelve solo las evaluaciones activas, no finalizadas y que aún no han sido respondidas por el estudiante.

6. Ver evaluaciones completadas
```
GET /estudiante/evaluaciones/completadas
```
Devuelve las evaluaciones que el estudiante ya completó (es decir, ya respondió), incluyendo también aquellas que han sido finalizadas.

7. Responder una evaluación

```
POST /estudiante/evaluacion/:asignId/responder
```
Permite que el estudiante se inscriba a un curso. 


Body JSON:
```
{
  "puntuacion": 6,
  "fortalezas": "Buen trabajo en equipo",
  "aspectos_dev": "Podría mejorar la documentación"
}
```
8. Ver feedback recibido
```
GET /estudiante/feedback
```
Devuelve el promedio de puntuación recibida por el estudiante en evaluaciones donde el feedback fue habilitado por el docente. Solo muestra feedback si la evaluación fue finalizada y el profesor permitió visibilidad.
