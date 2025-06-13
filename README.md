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

### Correr el Backend

En la raiz del proyecto correr 
```
node src/index.js
```