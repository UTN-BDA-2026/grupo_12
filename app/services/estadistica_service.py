from sqlalchemy.orm import Session
from sqlalchemy import text

def obtener_estadisticas_turnos(db: Session):
    # ESTRATEGIA DE SQL CRUDO (raw sql):
    # Abstraer esto con el ORM era ineficienet para el motor de PostgreSQL
    # Inyectamos SQL puro para garantizar el mejor plan de ejecucion
    consulta_sql = """
        SELECT m.matricula, m.nombre, m.apellido, COUNT(t.id) AS cantidad_turnos
        FROM medicos m
        LEFT JOIN turnos t ON m.id = t.medico_id
        GROUP BY m.id, m.matricula, m.nombre, m.apellido
        ORDER BY cantidad_turnos DESC;
    """
    # La funcion text() puentea la capa de abstraccion y envia la consulta directo al motor 
    resultado = db.execute(text(consulta_sql))
    estadisticas = resultado.mappings().all()

    return {"mensaje": "Estadisticas calculadas", "data": estadisticas}