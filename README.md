# Gestión de turnos médicos

Sistemas de Turnos Médicos desarrollado de forma integral. La aplicación cuenta con una arquitectura desacoplada: un backend robusto de alto rendimiento y una interfaz de usuario interactiva y moderna.

---

## 🛠️ Tecnologías Utilizadas

### Backend
* **FastAPI**: Framework de Python de alta velocidad para la construcción de la API.
* **PostgreSQL**: Base de datos relacional para el almacenamiento persistente.
* **SQLAlchemy**: ORM para el mapeo y gestión de modelos relacionales.
* **Pydantic**: Validación de esquemas de datos y contratos de la API.
* **Raw SQL**: Implementado específicamente en módulos analíticos (Dashboard) para optimizar el rendimiento de consultas agregadas saltando el ORM.

### Frontend
* **React (Vite)**: Entorno de desarrollo rápido y eficiente.
* **Tailwind CSS**: Framework de diseño para una interfaz limpia, responsiva y corporativa.
* **React Router Dom**: Gestión del enrutamiento interno de la aplicación.
* **React Big Calendar & date-fns**: Motor y localización al español del calendario interactivo de turnos.
* **Recharts**: Renderizado de gráficos analíticos interactivos.
* **Lucide React**: Set de íconos vectoriales profesionales.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu equipo:
1. **Python 3.10 o superior**
2. **Node.js (versión 18 o superior) y npm**
3. **PostgreSQL** corriendo localmente.
4. **Visual Studio Code** con la extensión **DBCODE** recomendada para gestionar la base de datos sin salir del editor.

---

## 🚀 Instrucciones de Instalación y Despliegue

Sigue estos pasos en orden para poner el proyecto en marcha localmente.

## 1. Clonar el repositorio
1. Abrir una terminal y descargar el proyecto ejecutando:
```
git clone https://github.com/UTN-BDA-2026/grupo_12
```
2. Luego de que se descarguen todas las carpeta, ejecutar:
```
cd grupo_12
```

## 2. Configurar las variables de entorno
En la raíz del proyecto, crear un archivo llamado ".env" y pegar el siguiente codigo:
```
DATABASE_URL=postgresql://postgres:(su contraseña de postgreSQL)@localhost:5432/turnos_medicos
FRONTEND_URL=http://localhost:5173
```

## 3. Configuración de la Base de Datos (PostgreSQL)
1. Instala y abrí la extensión **DBCODE** en Visual Studio Code.
2. Conecta la extensión a tu servidor local de PostgreSQL.
3. Crea una base de datos vacía llamada exactamente `turnos_medicos`.

## 4. Configuración del Backend (FastAPI)
El código del backend se encuentra directamente en la raíz del proyecto. Abre una terminal en la raíz y ejecuta los siguientes comandos:

#### Crear el entorno virtual (Venv)
```
python -m venv venv
```
#### Activar el entorno virtual
##### En macOS/Linux:
```
source venv/bin/activate
```
##### En Windows (CMD):
```
venv\Scripts\activate
```
##### En Windows (PowerShell):
```
.\venv\Scripts\Activate.ps1
```

#### Instalar las dependencias requeridas:
```
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic
```
```
pip install -r requirements.txt
```
## 5. Poblar la base de datos
```
python seed_db.py
```
## 6. Levantar el backend
```
uvicorn main:app --reload
```
Puedes acceder a la documentación interactiva y probar los endpoints desde el Swagger UI en: http://127.0.0.1:8000/docs

## 7. Configuración del frontend
Abre una nueva ventana de la terminal, ubícate en la raíz del proyecto y ejecuta:
```
cd frontend
```
```
npm install
```
```
npm run dev
```

