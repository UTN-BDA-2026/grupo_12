import os 
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Cargar las variables del archivo .env
load_dotenv()

# Obtener la URL de conexion
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Crear el motor de la base de datos
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Crear una fabrica de sesiones para interactuar con la DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base de la cual heredaran todos nuestros modelos (tablas)
Base = declarative_base()

# Dependencia para inyectar la sesion en los endopoints de FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()