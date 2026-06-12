from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    dni = Column(String, unique=True, index=True, nullable=False)
    email = Column(String)
    telefono = Column(String)
    obra_social_id = Column(Integer, ForeignKey("obras_sociales.id"), nullable=True)
    numero_credencial = Column(String, nullable=True)

    obra_social = relationship("ObraSocial", back_populates="pacientes")