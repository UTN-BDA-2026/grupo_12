from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import schemas
from app.db.database import get_db
from app.services import historia_clinica_service

router = APIRouter(prefix="/historias-clinicas", tags=["Historias Clinicas"])

@router.post("/", response_model=schemas.HistoriaClinica)
def crear_registro_historia(registro: schemas.HistoriaClinicaCreate, db: Session = Depends(get_db)):
    return historia_clinica_service.crear_registro_historia(db=db, registro=registro)

@router.get("/paciente/{paciente_id}", response_model=List[schemas.HistoriaClinica])
def obtener_historial_paciente(paciente_id: int, db: Session = Depends(get_db)):
    return historia_clinica_service.obtener_historial_paciente(db=db, paciente_id=paciente_id)