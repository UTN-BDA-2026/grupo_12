from pydantic import BaseModel
from typing import Optional, List

# Esquema base con los datos que necesitamos recibir
class PacienteBase(BaseModel):
    nombre: str
    apellido: str
    dni: str
    email: Optional[str] = None
    telefono: Optional[str] = None

# Esquema para la creacion (Hereda del base, por ahora son identicos)
class PacienteCreate(PacienteBase):
    pass

# Esquema de respuesta (lo que el servidor devuelve despues de crearlo)
class Paciente(PacienteBase):
    id: int # Le sumamos el id que le asigna la base de datos

    class Config:
        from_attributes = True # Esto permite que pydantic lea los datos del ORM de SQLAlchemy

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