from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class TurnoBase(BaseModel):
    fecha: datetime
    medico_id: int
    paciente_id: int
    motivo: str
    estado: str = "Pendiente"
    notas: Optional[str] = None
    monto_obra_social: Decimal = Decimal('0.00')
    monto_copago: Decimal = Decimal('0.00')

class TurnoCreate(TurnoBase):
    pass

class TurnoUpdate(BaseModel):
    estado: Optional[str] = None
    notas: Optional[str] = None
    monto_copago: Optional[Decimal] = None

class Turno(TurnoBase):
    id: int 
    class Config:
        from_attributes = True