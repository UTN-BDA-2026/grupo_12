import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app import models
from app.db.database import engine
from app.routers import (
    pacientes, 
    medicos, 
    turnos, 
    historias_clinicas, 
    especialidades, 
    obras_sociales, 
    estadisticas
)

load_dotenv()

# Crea las tablas si no existen en PostgreSQL
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Turnos Medicos - API Modular")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# --- INCLUSIÓN DE LOS ROUTERS MODULARES ---
app.include_router(pacientes.router)
app.include_router(medicos.router)
app.include_router(turnos.router)
app.include_router(historias_clinicas.router)
app.include_router(especialidades.router)
app.include_router(obras_sociales.router)
app.include_router(estadisticas.router)

@app.get("/ping", tags=["Health"])
def ping():
    return {"message": "El servidor está funcionando correctamente con arquitectura modular."}