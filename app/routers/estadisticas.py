from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services import estadistica_service

router = APIRouter(prefix="/estadisticas", tags=["Administracion"])

@router.get("/turnos-por-medico")
def obtener_estadisticas_turnos(db: Session = Depends(get_db)):
    return estadistica_service.obtener_estadisticas_turnos(db=db)