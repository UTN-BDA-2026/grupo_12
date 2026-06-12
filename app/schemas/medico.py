from pydantic import BaseModel

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