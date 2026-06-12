# app/routers/pacientes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import schemas
from app.db.database import get_db
from app.services import paciente_service # Importamos nuestra nueva capa lógica

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])

@router.post("/", response_model=schemas.Paciente)
def crear_paciente(paciente: schemas.PacienteCreate, db: Session = Depends(get_db)):
    # El router solo delega la tarea al servicio
    return paciente_service.crear_paciente(db=db, paciente=paciente)

@router.get("/", response_model=List[schemas.Paciente])
def obtener_pacientes(db: Session = Depends(get_db)):
    return paciente_service.obtener_pacientes(db=db)

@router.get("/buscar/{dni}", response_model=schemas.Paciente)
def buscar_paciente_por_dni(dni: str, db: Session = Depends(get_db)):
    return paciente_service.buscar_paciente_por_dni(db=db, dni=dni)

@router.put("/{paciente_id}", response_model=schemas.Paciente)
def actualizar_paciente(paciente_id: int, paciente_actualizado: schemas.PacienteCreate, db: Session = Depends(get_db)):
    return paciente_service.actualizar_paciente(db=db, paciente_id=paciente_id, paciente_actualizado=paciente_actualizado)

@router.delete("/{paciente_id}")
def eliminar_paciente(paciente_id: int, db: Session = Depends(get_db)):
    return paciente_service.eliminar_paciente(db=db, paciente_id=paciente_id)