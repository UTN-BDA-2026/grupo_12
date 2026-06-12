from pydantic import BaseModel
from decimal import Decimal

class ObraSocialBase(BaseModel):
    nombre: str
    cobertura_base: Decimal = Decimal('0.00')

class ObraSocialCreate(ObraSocialBase):
    pass

class ObraSocial(ObraSocialBase):
    id: int
    class Config:
        from_attributes = True