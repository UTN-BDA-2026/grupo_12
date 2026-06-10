from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from decimal import Decimal

# --- ESQUEMAS DE OBRAS SOCIALES ---
class ObraSocialBase(BaseModel):
    nombre: str
    cobertura_base: Decimal = Decimal('0.00')

class ObraSocialCreate(ObraSocialBase):
    pass

class ObraSocial(ObraSocialBase):
    id: int
    class Config:
        from_attributes = True

# --- ESQUEMAS DE PACIENTES ---
class PacienteBase(BaseModel):
    nombre: str
    apellido: str
    dni: str
    email: Optional[str] = None
    telefono: Optional[str] = None
    obra_social_id: Optional[int] = None
    numero_credencial: Optional[str] = None

class PacienteCreate(PacienteBase):
    pass

class Paciente(PacienteBase):
    id: int 
    class Config:
        from_attributes = True

# --- ESQUEMAS DE ESPECIALIDADES ---
class EspecialidadBase(BaseModel):
    nombre: str

class EspecialidadCreate(EspecialidadBase):
    pass

class Especialidad(EspecialidadBase):
    id: int
    class Config:
        from_attributes = True

# --- ESQUEMAS DE MEDICOS ---
class MedicoBase(BaseModel):
    nombre: str
    apellido: str
    matricula: str
    especialidad_id: int

class MedicoCreate(MedicoBase):
    pass

class Medico(MedicoBase):
    id: int
    class Config:
        from_attributes = True

# --- ESQUEMAS DE TURNOS ---
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

# --- ESQUEMAS DE HISTORIAS CLINICAS ---
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