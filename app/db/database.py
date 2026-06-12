import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Cargamos las variables de entorno (como la contraseña de la DB)
load_dotenv()

# Obtenemos la URL de la base de datos desde el archivo .env
# Si no la encuentra, usa una por defecto para que no explote
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@localhost:5432/medisys_db"
)

# Creamos el "Engine" (el motor que se conecta físicamente a PostgreSQL)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Creamos la "Fábrica de Sesiones". Cada vez que un usuario pide algo, se abre una sesión nueva.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Creamos la clase "Base". De acá van a heredar todos nuestros modelos (Turno, Paciente, etc.)
Base = declarative_base()

# --- DEPENDENCIA PARA FASTAPI ---
# Esta función es la que le da a cada ruta (endpoint) una conexión fresca a la BD y la cierra al terminar.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()