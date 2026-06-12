from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app import schemas
from app.db.database import get_db
from app.services import turno_service

router = APIRouter(prefix="/turnos", tags=["Turnos"])

@router.post("/", response_model=schemas.Turno, status_code=status.HTTP_201_CREATED)
def crear_turno(turno: schemas.TurnoCreate, db: Session = Depends(get_db)):
    return turno_service.crear_turno_seguro(db=db, turno=turno)

@router.get("/", response_model=List[schemas.Turno])
def obtener_turnos(db: Session = Depends(get_db)):
    return turno_service.obtener_turnos(db=db)

@router.delete("/{turno_id}")
def eliminar_turno(turno_id: int, db: Session = Depends(get_db)):
    return turno_service.eliminar_turno(db=db, turno_id=turno_id)

@router.put("/{turno_id}", response_model=schemas.Turno)
def actualizar_turno(turno_id: int, turno_actualizado: schemas.TurnoUpdate, db: Session = Depends(get_db)):
    return turno_service.actualizar_turno(db=db, turno_id=turno_id, turno_actualizado=turno_actualizado)