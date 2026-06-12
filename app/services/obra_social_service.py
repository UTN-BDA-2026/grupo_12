from sqlalchemy.orm import Session
from sqlalchemy import asc
from app import models

def obtener_obras_sociales(db: Session):
    return db.query(models.ObraSocial).order_by(asc(models.ObraSocial.id)).all()