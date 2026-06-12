# app/services/paciente_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models, schemas

def obtener_pacientes(db: Session):
    return db.query(models.Paciente).all()

def buscar_paciente_por_dni(db: Session, dni: str):
    paciente = db.query(models.Paciente).filter(models.Paciente.dni == dni).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="No se encontró ningún paciente con ese DNI")
    return paciente

def crear_paciente(db: Session, paciente: schemas.PacienteCreate):
    db_paciente = db.query(models.Paciente).filter(models.Paciente.dni == paciente.dni).first()
    if db_paciente:
        raise HTTPException(status_code=400, detail="Ya existe un paciente con ese DNI")
    
    nuevo_paciente = models.Paciente(
        nombre=paciente.nombre,
        apellido=paciente.apellido,
        dni=paciente.dni,
        email=paciente.email,
        telefono=paciente.telefono,
        obra_social_id=paciente.obra_social_id,
        numero_credencial=paciente.numero_credencial
    )

    db.add(nuevo_paciente)
    db.commit()
    db.refresh(nuevo_paciente) 
    return nuevo_paciente

def actualizar_paciente(db: Session, paciente_id: int, paciente_actualizado: schemas.PacienteCreate):
    db_paciente = db.query(models.Paciente).filter(models.Paciente.id == paciente_id).first()
    if not db_paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    db_paciente.nombre = paciente_actualizado.nombre
    db_paciente.apellido = paciente_actualizado.apellido
    db_paciente.dni = paciente_actualizado.dni
    db_paciente.email = paciente_actualizado.email
    db_paciente.telefono = paciente_actualizado.telefono
    db_paciente.obra_social_id = paciente_actualizado.obra_social_id
    db_paciente.numero_credencial = paciente_actualizado.numero_credencial
    
    db.commit()
    db.refresh(db_paciente)
    return db_paciente

def eliminar_paciente(db: Session, paciente_id: int):
    db_paciente = db.query(models.Paciente).filter(models.Paciente.id == paciente_id).first()
    if not db_paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    db.delete(db_paciente)
    db.commit()
    return {"mensaje": "Paciente eliminado correctamente"}