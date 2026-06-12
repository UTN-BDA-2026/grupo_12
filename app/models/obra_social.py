from sqlalchemy import Column, Integer, String, Numeric
from sqlalchemy.orm import relationship
from app.db.database import Base

class ObraSocial(Base):
    __tablename__ = "obras_sociales"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    cobertura_base = Column(Numeric(10, 2), default=0.00)

    pacientes = relationship("Paciente", back_populates="obra_social")