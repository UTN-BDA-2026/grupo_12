from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import schemas
from app.db.database import get_db
from app.services import medico_service

router = APIRouter(prefix="/medicos", tags=["Medicos"])

@router.post("/", response_model=schemas.Medico)
def crear_medico(medico: schemas.MedicoCreate, db: Session = Depends(get_db)):
    return medico_service.crear_medico(db=db, medico=medico)

@router.get("/", response_model=List[schemas.Medico])
def obtener_medicos(db: Session = Depends(get_db)):
    return medico_service.obtener_medicos(db=db)

@router.put("/{medico_id}", response_model=schemas.Medico)
def actualizar_medico(medico_id: int, medico_actualizado: schemas.MedicoCreate, db: Session = Depends(get_db)):
    return medico_service.actualizar_medico(db=db, medico_id=medico_id, medico_actualizado=medico_actualizado)

@router.delete("/{medico_id}")
def eliminar_medico(medico_id: int, db: Session = Depends(get_db)):
    return medico_service.eliminar_medico(db=db, medico_id=medico_id)