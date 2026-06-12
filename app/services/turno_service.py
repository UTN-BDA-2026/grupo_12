from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app import models, schemas

def crear_turno_seguro(db: Session, turno: schemas.TurnoCreate):
    try:
        turno_existente = db.query(models.Turno).filter(
            models.Turno.medico_id == turno.medico_id,
            models.Turno.fecha == turno.fecha
        ).with_for_update().first()
        
        if turno_existente:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El médico ya tiene un turno registrado.")
        
        paciente_ocupado = db.query(models.Turno).filter(
            models.Turno.paciente_id == turno.paciente_id,
            models.Turno.fecha == turno.fecha
        ).first()
        
        if paciente_ocupado:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El paciente ya tiene un turno registrado.")
        
        paciente_db = db.query(models.Paciente).filter(models.Paciente.id == turno.paciente_id).first()
        cobertura = 0.00
        if paciente_db and paciente_db.obra_social_id:
            obra_social = db.query(models.ObraSocial).filter(models.ObraSocial.id == paciente_db.obra_social_id).first()
            if obra_social:
                cobertura = obra_social.cobertura_base

        nuevo_turno = models.Turno(
            fecha=turno.fecha, medico_id=turno.medico_id,
            paciente_id=turno.paciente_id, motivo=turno.motivo,
            monto_obra_social=cobertura 
        )
        db.add(nuevo_turno)
        db.commit()
        db.refresh(nuevo_turno)
        return nuevo_turno

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        db.rollback() 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error transaccional: {str(e)}")

def obtener_turnos(db: Session):
    return db.query(models.Turno).all()

def eliminar_turno(db: Session, turno_id: int):
    db_turno = db.query(models.Turno).filter(models.Turno.id == turno_id).first()
    if not db_turno:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    
    db.delete(db_turno)
    db.commit()
    return {"mensaje": "Turno cancelado y liberado correctamente"}

def actualizar_turno(db: Session, turno_id: int, turno_actualizado: schemas.TurnoUpdate):
    db_turno = db.query(models.Turno).filter(models.Turno.id == turno_id).first()
    if not db_turno:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    
    if turno_actualizado.estado is not None:
        db_turno.estado = turno_actualizado.estado
    if turno_actualizado.notas is not None:
        db_turno.notas = turno_actualizado.notas
    if turno_actualizado.monto_copago is not None:
        db_turno.monto_copago = turno_actualizado.monto_copago
        
    db.commit()
    db.refresh(db_turno)
    return db_turno