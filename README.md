# ⚡ SysHardware - Sistema de Gestión de Inventario y Ventas

SysHardware es una plataforma integral desarrollada para la gestión eficiente de inventarios y control de ventas de componentes de hardware. El sistema cuenta con una arquitectura dividida en un backend robusto para el manejo de la lógica de negocio y un frontend interactivo para la experiencia del usuario.

## 👥 Equipo de Desarrollo
* Matias
* Mateo
* Marcos
* Julian

## 🚀 Tecnologías Utilizadas
* **Frontend:** React, Vite
* **Backend:** Python, FastAPI, Uvicorn
* **Base de Datos:** PostgreSQL

## 📋 Requisitos Previos
Para poder ejecutar este proyecto de manera local, es necesario contar con:
* Python 3.8 o superior.
* Node.js y npm.
* PostgreSQL instalado y en ejecución.

## ⚙️ Instrucciones para levantar el entorno local

Sigue estos pasos para ejecutar el proyecto en tu máquina:

### 1. Preparación de la Base de Datos
* Asegúrate de tener el servicio de PostgreSQL corriendo localmente.
* La base de datos no requiere contraseña en el entorno de desarrollo actual.
* Ejecuta el script para popular la base con datos de prueba:
  ```bash
  source venv/bin/activate
  python generador.py
  ```

### 2. Levantar el backend (fastAPI)
* Abre una terminal en la raíz del proyecto (carpeta inventario-hardware), activa el entorno virtual y arranca el servidor con recarga automática:
  ```
  source venv/bin/activate
  uvicorn main:app --reload
  ```
  
### 3. Levantar el frontend (react)
* Abre una segunda terminal, ingresa a la carpeta del frontend y levanta el servidor de desarrollo:
  ```bash
  cd frontend
  npm run dev
