from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import schemas
from app.db.database import get_db
from app.services import obra_social_service

router = APIRouter(prefix="/obras-sociales", tags=["Obras Sociales"])

@router.get("/", response_model=List[schemas.ObraSocial])
def obtener_obras_sociales(db: Session = Depends(get_db)):
    return obra_social_service.obtener_obras_sociales(db=db)