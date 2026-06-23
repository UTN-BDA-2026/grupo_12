import os
import subprocess
import sys
from dotenv import load_dotenv

DIRECTORIO_ACTUAL = os.path.dirname(os.path.abspath(__file__))
DIRECTORIO_RAIZ = os.path.dirname(DIRECTORIO_ACTUAL)
ruta_env = os.path.join(DIRECTORIO_RAIZ, '.env')

load_dotenv(ruta_env)

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "turnos_medicos")

carpeta_backups = os.path.join(DIRECTORIO_RAIZ, 'backups')

# Le pedimos al usuario que escriba qué archivo quiere recuperar
print(f"Buscando backups en: {carpeta_backups}")
# --- INTERACCIÓN Y CONTROL DE ERRORES ---
archivo_backup = input("Ingresá el nombre exacto del archivo de backup a restaurar (ej: backup_turnos_medicos_20260611_103000.sql): ")
ruta_backup = os.path.join(carpeta_backups, archivo_backup)

# Validación temprana: Evita que el script intente ejecutar comandos corruptos si el usuario se equivoca
if not os.path.exists(ruta_backup):
    print(f"❌ El archivo {ruta_backup} no existe. Verificá el nombre y volvé a intentar.")
    sys.exit(1)

# --- DISASTER RECOVERY (psql) ---
# Utilizamos el cliente nativo de línea de comandos de PostgreSQL (psql) para inyectar todo el archivo SQL directamente en el motor, restaurando el estado exacto.    
# Comando nativo de PostgreSQL para restaurar (pisando la base de datos actual)
comando = f"psql -U {DB_USER} -h {DB_HOST} -p {DB_PORT} -d {DB_NAME} -f {ruta_backup}"
os.environ["PGPASSWORD"] = DB_PASSWORD

print(f"Restaurando la base de datos desde '{ruta_backup}'...")
resultado = subprocess.run(comando, shell=True, capture_output=True, text=True)

if resultado.returncode == 0:
    print("✅ Base de datos restaurada con éxito.")
else:
    print(f"❌ Error al restaurar:\n{resultado.stderr}")