from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Especialidad(Base):
    __tablename__ = "especialidades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)

    # Relacion para que SQLAlchemy sepa qué médicos tienen esta especialidad
    medicos = relationship("Medico", back_populates="especialidad")

class Medico(Base):
    __tablename__ = "medicos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    matricula = Column(String, unique=True, nullable=False)

    # Clave foranea que conecta con la especialidad
    especialidad_id = Column(Integer, ForeignKey("especialidades.id"))

    # Relacion inversa
    especialidad = relationship("Especialidad", back_populates="medicos")

class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)

    # Al poner index=True en el DNI ya estamos dejando preparado el terreno para cumplir con el requisito de Indices que se pide.
    dni = Column(String, unique=True, index=True, nullable=False)
    email = Column(String)
    telefono = Column(String)