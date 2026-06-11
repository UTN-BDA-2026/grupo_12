import os
import subprocess
from datetime import datetime
from dotenv import load_dotenv

# Calculamos las rutas exactas para no tener errores de carpetas
DIRECTORIO_ACTUAL = os.path.dirname(os.path.abspath(__file__))
DIRECTORIO_RAIZ = os.path.dirname(DIRECTORIO_ACTUAL)
ruta_env = os.path.join(DIRECTORIO_RAIZ, '.env')

# Cargamos credenciales de la caja fuerte
load_dotenv(ruta_env)

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "turnos_medicos")

# Crear carpeta de backups si no existe
carpeta_backups = os.path.join(DIRECTORIO_RAIZ, 'backups')
os.makedirs(carpeta_backups, exist_ok=True)

# Armamos el nombre del archivo con la fecha y hora exacta
fecha_actual = datetime.now().strftime("%Y%m%d_%H%M%S")
nombre_archivo = f"backup_{DB_NAME}_{fecha_actual}.sql"
ruta_backup = os.path.join(carpeta_backups, nombre_archivo)

# Comando nativo de PostgreSQL para copias de seguridad
comando = f"pg_dump -U {DB_USER} -h {DB_HOST} -p {DB_PORT} -f {ruta_backup} {DB_NAME}"

# Le pasamos la contraseña al sistema temporalmente
os.environ["PGPASSWORD"] = DB_PASSWORD

print(f"Iniciando backup de la base de datos '{DB_NAME}'...")
resultado = subprocess.run(comando, shell=True, capture_output=True, text=True)

if resultado.returncode == 0:
    print(f"✅ Backup realizado con éxito. Archivo guardado en: {ruta_backup}")
else:
    print(f"❌ Error al hacer el backup:\n{resultado.stderr}")