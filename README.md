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
INSERT INTO Usuario (nombre, email, rol)
VALUES ('Docente Demo', 'docente@demo.com', 'Docente');
```

Esto funciona para el middleware testAuth.js que está simulando que el usuario con user_id: 1 está autenticado.

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
9. Ver todas las evaluaciones de un curso
```
GET /docente/curso/:cursoId/evaluaciones
```
Devuelve todas las evaluaciones (activas o no) del curso.

10. Ver evaluaciones activas de un curso
```
GET /docente/curso/:cursoId/evaluaciones/activas
```
Devuelve solo las evaluaciones activas del curso.

11. Cambiar estado de evaluación (activar/desactivar)
```
PUT /docente/evaluacion/:evaluacionId/estado
```
Activa o desactiva una evaluación, y sus asignaciones.

Body JSON:
```
{
  "activa": true
}
```
12. Contar respuestas en una evaluación
```
GET /docente/evaluacion/:evaluacionId/resumen
```
Devuelve cuántas respuestas han sido registradas y el porcentaje de avance.

12. Progreso por estudiante en una evaluación (agrupado por grupo)
```
GET /docente/curso/:cursoId/evaluacion/:evaluacionId/progreso
```
Devuelve por grupo el avance de cada estudiante evaluador en la evaluación (número de respuestas enviadas respecto al total que debe hacer).

