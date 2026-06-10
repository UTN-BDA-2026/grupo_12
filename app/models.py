from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime, timezone

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

class Turno(Base):
    __tablename__ = "turnos"

    # Le indicamos a PostgreSQL que particione esta tabla por rangos de fecha
    table_args = (
        {"postgresql_partition_by": "RANGE (fecha)"},
    )

    # En tablas particionadas por rango, la columna de particion DEBE ser parte de la clave primaria
    id = Column(Integer, primary_key=True, autoincrement=True)
    fecha = Column(DateTime, primary_key=True)

    medico_id = Column(Integer, ForeignKey("medicos.id"))
    paciente_id = Column(Integer, ForeignKey("pacientes.id"))
    motivo = Column(String)

    # --- NUEVOS CAMPOS ---
    estado = Column(String, default="Pendiente")
    notas = Column(String, nullable=True)

    # Relaciones para acceder a los datos cruzados facilmente
    medico = relationship("Medico")
    paciente = relationship("Paciente")

class HistoriaClinica(Base):
    __tablename__ = "historias_clinicas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    paciente_id = Column(Integer, ForeignKey("pacientes.id"))
    medico_id = Column(Integer, ForeignKey("medicos.id"))

    # Aca esta la magia NoSQL: un campo de estrutura dinamica
    datos_medicos = Column(JSONB)

    # Relaciones
    paciente = relationship("Paciente")
    medico = relationship("Medico")