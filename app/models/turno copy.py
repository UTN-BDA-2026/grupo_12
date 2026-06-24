from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from app.db.database import Base

class Turno(Base):
    __tablename__ = "turnos"
    table_args = (
        {"postgresql_partition_by": "RANGE (fecha)"},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    fecha = Column(DateTime, primary_key=True)
    medico_id = Column(Integer, ForeignKey("medicos.id"), index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), index=True)
    motivo = Column(String)
    estado = Column(String, default="Pendiente")
    notas = Column(String, nullable=True)
    monto_obra_social = Column(Numeric(10, 2), default=0.00)
    monto_copago = Column(Numeric(10, 2), default=0.00)

    medico = relationship("Medico")
    paciente = relationship("Paciente")