from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime, timezone

class ObraSocial(Base):
    __tablename__ = "obras_sociales"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    # Usamos Numeric para manejar dinero con 2 decimales de precisión
    cobertura_base = Column(Numeric(10, 2), default=0.00)

    pacientes = relationship("Paciente", back_populates="obra_social")

class Especialidad(Base):
    __tablename__ = "especialidades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    medicos = relationship("Medico", back_populates="especialidad")

class Medico(Base):
    __tablename__ = "medicos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    matricula = Column(String, unique=True, nullable=False)
    especialidad_id = Column(Integer, ForeignKey("especialidades.id"))
    especialidad = relationship("Especialidad", back_populates="medicos")

class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    dni = Column(String, unique=True, index=True, nullable=False)
    email = Column(String)
    telefono = Column(String)
    
    # --- NUEVOS CAMPOS ---
    obra_social_id = Column(Integer, ForeignKey("obras_sociales.id"), nullable=True)
    numero_credencial = Column(String, nullable=True)

    obra_social = relationship("ObraSocial", back_populates="pacientes")

class Turno(Base):
    __tablename__ = "turnos"
    table_args = (
        {"postgresql_partition_by": "RANGE (fecha)"},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    fecha = Column(DateTime, primary_key=True)
    medico_id = Column(Integer, ForeignKey("medicos.id"))
    paciente_id = Column(Integer, ForeignKey("pacientes.id"))
    motivo = Column(String)
    estado = Column(String, default="Pendiente")
    notas = Column(String, nullable=True)
    
    # --- NUEVOS CAMPOS FINANCIEROS ---
    monto_obra_social = Column(Numeric(10, 2), default=0.00)
    monto_copago = Column(Numeric(10, 2), default=0.00)

    medico = relationship("Medico")
    paciente = relationship("Paciente")

class HistoriaClinica(Base):
    __tablename__ = "historias_clinicas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    paciente_id = Column(Integer, ForeignKey("pacientes.id"))
    medico_id = Column(Integer, ForeignKey("medicos.id"))
    datos_medicos = Column(JSONB)
    paciente = relationship("Paciente")
    medico = relationship("Medico")