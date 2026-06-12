from sqlalchemy.orm import Session
from sqlalchemy import asc
from fastapi import HTTPException
from app import models, schemas

def crear_medico(db: Session, medico: schemas.MedicoCreate):
    db_medico = db.query(models.Medico).filter(models.Medico.matricula == medico.matricula).first()
    if db_medico:
        raise HTTPException(status_code=400, detail="Ya existe un medico con esa matricula")

    nuevo_medico = models.Medico(
        nombre=medico.nombre, apellido=medico.apellido,
        matricula=medico.matricula, especialidad_id=medico.especialidad_id
    )
    db.add(nuevo_medico)
    db.commit()
    db.refresh(nuevo_medico)
    return nuevo_medico

def obtener_medicos(db: Session):
    return db.query(models.Medico).order_by(asc(models.Medico.id)).all()

def actualizar_medico(db: Session, medico_id: int, medico_actualizado: schemas.MedicoCreate):
    db_medico = db.query(models.Medico).filter(models.Medico.id == medico_id).first()
    if not db_medico:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    
    db_medico.nombre = medico_actualizado.nombre
    db_medico.apellido = medico_actualizado.apellido
    db_medico.matricula = medico_actualizado.matricula
    db_medico.especialidad_id = medico_actualizado.especialidad_id
    
    db.commit()
    db.refresh(db_medico)
    return db_medico

def eliminar_medico(db: Session, medico_id: int):
    db_medico = db.query(models.Medico).filter(models.Medico.id == medico_id).first()
    if not db_medico:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    
    db.delete(db_medico)
    db.commit()
    return {"mensaje": f"Médico {db_medico.nombre} {db_medico.apellido} eliminado correctamente"}