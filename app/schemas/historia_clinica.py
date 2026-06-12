from pydantic import BaseModel
from typing import Any, Dict
from datetime import datetime

class HistoriaClinicaBase(BaseModel):
    paciente_id: int
    medico_id: int
    datos_medicos: Dict[str, Any]

class HistoriaClinicaCreate(HistoriaClinicaBase):
    pass

class HistoriaClinica(HistoriaClinicaBase):
    id: int
    fecha: datetime
    class Config:
        from_attributes = True