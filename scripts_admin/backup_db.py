import os
import subprocess
from datetime import datetime
from dotenv import load_dotenv

# --- RUTAS DINAMICAS ---
# Garantiza que el script funcione sin importar desde que computadora o servidor se ejecute
# Calculamos las rutas exactas para no tener errores de carpetas
DIRECTORIO_ACTUAL = os.path.dirname(os.path.abspath(__file__))
DIRECTORIO_RAIZ = os.path.dirname(DIRECTORIO_ACTUAL)
ruta_env = os.path.join(DIRECTORIO_RAIZ, '.env')

# --- SEGURIDAD (SECRET MANAGEMENT) ---
# Jamás hardcodeamos credenciales. Las leemos de la caja fuerte local (.env) para que las contraseñas de producción nunca se suban al repositorio.
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

# --- VERSIONADO AUTOMÁTICO ---
# Generamos un Timestamp exacto para evitar pisar backups anteriores y mantener un historial de puntos de restauración.
# Armamos el nombre del archivo con la fecha y hora exacta
fecha_actual = datetime.now().strftime("%Y%m%d_%H%M%S")
nombre_archivo = f"backup_{DB_NAME}_{fecha_actual}.sql"
ruta_backup = os.path.join(carpeta_backups, nombre_archivo)

# --- BACKUP LÓGICO NATIVO (pg_dump) ---
# No usamos el ORM para esto. Delegamos la tarea a la utilidad nativa de PostgreSQL que garantiza una extracción íntegra (DDL y DML) de la base de datos.
# Comando nativo de PostgreSQL para copias de seguridad
comando = f"pg_dump -U {DB_USER} -h {DB_HOST} -p {DB_PORT} -f {ruta_backup} {DB_NAME}"

# Inyectamos la contraseña en el entorno del subproceso de forma efímera y segura
os.environ["PGPASSWORD"] = DB_PASSWORD

print(f"Iniciando backup de la base de datos '{DB_NAME}'...")

# --- EJECUCIÓN A NIVEL SISTEMA OPERATIVO ---
# Usamos subprocess para que Python actúe como un orquestador del sistema
resultado = subprocess.run(comando, shell=True, capture_output=True, text=True)

if resultado.returncode == 0:
    print(f"✅ Backup realizado con éxito. Archivo guardado en: {ruta_backup}")
else:
    print(f"❌ Error al hacer el backup:\n{resultado.stderr}")