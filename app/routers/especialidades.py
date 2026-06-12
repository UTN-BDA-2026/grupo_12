from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import schemas
from app.db.database import get_db
from app.services import especialidad_service

router = APIRouter(prefix="/especialidades", tags=["Especialidades"])

@router.post("/", response_model=schemas.Especialidad)
def crear_especialidad(especialidad: schemas.EspecialidadCreate, db: Session = Depends(get_db)):
    return especialidad_service.crear_especialidad(db=db, especialidad=especialidad)

@router.get("/", response_model=List[schemas.Especialidad])
def obtener_especialidades(db: Session = Depends(get_db)):
    return especialidad_service.obtener_especialidades(db=db)