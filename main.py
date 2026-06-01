from typing import List
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session  
from app import models, schemas
from app.database import engine, get_db

# Crea las tablas si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title = "Sistema de Turnos Medicos")

@app.get("/ping")
def ping():
    return {"message": "El servidor está funcionando correctamente."}

# --- RUTAS PARA PACIENTES ---
@app.post("/pacientes/", response_model=schemas.Paciente)
def crear_paciente(paciente: schemas.PacienteCreate, db: Session = Depends(get_db)):
    # 1. Verificamos si ya existe alguien con ese DNI en la base
    db_paciente = db.query(models.Paciente).filter(models.Paciente.dni == paciente.dni).first()
    if db_paciente:
        raise HTTPException(status_code=400, detail="Ya existe un paciente con ese DNI")
    
    # 2. Creamos el objeto del ORM con los datos que llegaron
    nuevo_paciente = models.Paciente(
        nombre=paciente.nombre,
        apellido=paciente.apellido,
        dni=paciente.dni,
        email=paciente.email,
        telefono=paciente.telefono
    )

    # 3. Lo guardamos en PostgreSQL
    db.add(nuevo_paciente)
    db.commit()
    db.refresh(nuevo_paciente) # Actualizamos para que nos devuelva el ID autogenerado
    return nuevo_paciente

@app.get("/pacientes/", response_model=List[schemas.Paciente])
def obtener_pacientes(db: Session = Depends(get_db)):
    return db.query(models.Paciente).all()

@app.get("/pacientes/buscar/{dni}", response_model=schemas.Paciente)
def buscar_paciente_por_dni(dni: str, db: Session = Depends(get_db)):
    paciente = db.query(models.Paciente).filter(models.Paciente.dni == dni).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="No se encontró ningún paciente con ese DNI")
    return paciente

# --- RUTAS DE ESPECIALIDADES ---
@app.post("/especialidades/", response_model=schemas.Especialidad)
def crear_especialidad(especialidad: schemas.EspecialidadCreate, db: Session = Depends(get_db)):
    db_especialidad = db.query(models.Especialidad).filter(models.Especialidad.nombre == especialidad.nombre).first()
    if db_especialidad:
        raise HTTPException(status_code=400, detail="Ya existe una especialidad con ese nombre")
    
    nueva_especialidad = models.Especialidad(nombre=especialidad.nombre)
    db.add(nueva_especialidad)
    db.commit()
    db.refresh(nueva_especialidad)
    return nueva_especialidad

@app.get("/especialidades/", response_model=List[schemas.Especialidad])
def obtener_especialidades(db: Session = Depends(get_db)):
    return db.query(models.Especialidad).all()  

# --- RUTAS DE MEDICOS ---
@app.post("/medicos/", response_model=schemas.Medico)
def crear_medico(medico: schemas.MedicoCreate, db: Session = Depends(get_db)):
    db_medico = db.query(models.Medico).filter(models.Medico.matricula == medico.matricula).first()
    if db_medico:
        raise HTTPException(status_code=400, detail="Ya existe un medico con esa matricula")

    nuevo_medico = models.Medico(
        nombre=medico.nombre,
        apellido=medico.apellido,
        matricula=medico.matricula,
        especialidad_id=medico.especialidad_id
    )
    db.add(nuevo_medico)
    db.commit()
    db.refresh(nuevo_medico)
    return nuevo_medico

@app.get("/medicos/", response_model=List[schemas.Medico])
def obtener_medicos(db: Session = Depends(get_db)):
    return db.query(models.Medico).all()