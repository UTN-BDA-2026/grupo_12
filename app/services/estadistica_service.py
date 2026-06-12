from sqlalchemy.orm import Session
from sqlalchemy import text

def obtener_estadisticas_turnos(db: Session):
    consulta_sql = """
        SELECT m.matricula, m.nombre, m.apellido, COUNT(t.id) AS cantidad_turnos
        FROM medicos m
        LEFT JOIN turnos t ON m.id = t.medico_id
        GROUP BY m.id, m.matricula, m.nombre, m.apellido
        ORDER BY cantidad_turnos DESC;
    """
    resultado = db.execute(text(consulta_sql))
    estadisticas = resultado.mappings().all()

    return {"mensaje": "Estadisticas calculadas", "data": estadisticas}