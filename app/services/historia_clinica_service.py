from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from app import models, schemas

def crear_registro_historia(db: Session, registro: schemas.HistoriaClinicaCreate):
    paciente = db.query(models.Paciente).filter(models.Paciente.id == registro.paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
    medico = db.query(models.Medico).filter(models.Medico.id == registro.medico_id).first()
    if not medico:
        raise HTTPException(status_code=404, detail="Médico no encontrado")

    db_registro = models.HistoriaClinica(
        paciente_id=registro.paciente_id,
        medico_id=registro.medico_id,
        datos_medicos=registro.datos_medicos, 
        fecha=datetime.now()
    )
    
    db.add(db_registro)
    db.commit()
    db.refresh(db_registro)
    return db_registro

def obtener_historial_paciente(db: Session, paciente_id: int):
    return db.query(models.HistoriaClinica).filter(models.HistoriaClinica.paciente_id == paciente_id).order_by(models.HistoriaClinica.fecha.desc()).all()