from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models, schemas

def crear_especialidad(db: Session, especialidad: schemas.EspecialidadCreate):
    db_especialidad = db.query(models.Especialidad).filter(models.Especialidad.nombre == especialidad.nombre).first()
    if db_especialidad:
        raise HTTPException(status_code=400, detail="Ya existe una especialidad con ese nombre")
    
    nueva_especialidad = models.Especialidad(nombre=especialidad.nombre)
    db.add(nueva_especialidad)
    db.commit()
    db.refresh(nueva_especialidad)
    return nueva_especialidad

def obtener_especialidades(db: Session):
    return db.query(models.Especialidad).all()