from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base

class HistoriaClinica(Base):
    __tablename__ = "historias_clinicas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fecha = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    paciente_id = Column(Integer, ForeignKey("pacientes.id"))
    medico_id = Column(Integer, ForeignKey("medicos.id"))
    datos_medicos = Column(JSONB)
    
    paciente = relationship("Paciente")
    medico = relationship("Medico")