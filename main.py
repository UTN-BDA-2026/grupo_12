from fastapi import FastAPI
from app import models
from app.database import engine

# Esta es la linea magica que crea las tablas en la base de datos.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title = "Sistema de Turnos Medicos")

@app.get("/ping")
def ping():
    return {"message": "El servidor está funcionando correctamente."}