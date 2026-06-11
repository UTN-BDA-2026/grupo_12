import random
import unicodedata
import os
from faker import Faker
from app.database import engine, SessionLocal
from app import models
from sqlalchemy import text

# Inicializamos Faker con localizacion argentina para mayor realismo
fake = Faker('es_AR')

# -- CONGELAR EL AZAR PARA QUE SEA IGUAL PARA TODOS --
Faker.seed(1234)
random.seed(1234)

def restaurar_base_de_datos():
    print("Borrando tablas existentes para limpiar el lienzo...")
    models.Base.metadata.drop_all(bind=engine)
    print("Creando las tablas nuevamente desde cero...")
    # Al hacer create_all, SQLAlchemy ya lee tu models.py actualizado
    # y crea las columnas financieras y la tabla de obras sociales automáticamente.
    models.Base.metadata.create_all(bind=engine)

    # --- Ejecutar script de particiones ---
    print("Construyendo las particiones para la tabla de turnos...")

    # 1. Encontrar la ruta absoluta al script sql
    script_path = os.path.join(os.path.dirname(__file__), 'sql', '01_init_particiones_turnos.sql')

    # 2. Leer y ejecutar el sql y los Triggers directamente en la base de datos
    with engine.connect() as connection:
        # Particiones
        with open(script_path, 'r') as file:            
            query_sql = file.read()
            connection.execute(text(query_sql))
            
        # --- NUEVO: INYECCIÓN DEL TRIGGER DE AUDITORÍA DE SEGURIDAD ---
        print("Instalando el sistema de auditoría y triggers de seguridad...")
        trigger_sql = """
        CREATE TABLE IF NOT EXISTS auditoria_turnos (
            id SERIAL PRIMARY KEY,
            turno_id INT NOT NULL,
            accion VARCHAR(20) NOT NULL,
            estado_anterior VARCHAR(50),
            estado_nuevo VARCHAR(50),
            notas_anteriores TEXT,
            notas_nuevas TEXT,
            fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            usuario_db VARCHAR(100) DEFAULT CURRENT_USER
        );

        CREATE OR REPLACE FUNCTION funcion_auditar_turnos()
        RETURNS TRIGGER AS $$
        BEGIN
            IF (TG_OP = 'UPDATE') THEN
                INSERT INTO auditoria_turnos(turno_id, accion, estado_anterior, estado_nuevo, notas_anteriores, notas_nuevas)
                VALUES (OLD.id, 'UPDATE', OLD.estado, NEW.estado, OLD.notas, NEW.notas);
                RETURN NEW;
            ELSIF (TG_OP = 'DELETE') THEN
                INSERT INTO auditoria_turnos(turno_id, accion, estado_anterior, estado_nuevo, notas_anteriores, notas_nuevas)
                VALUES (OLD.id, 'DELETE', OLD.estado, NULL, OLD.notas, NULL);
                RETURN OLD;
            END IF;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_auditoria_turnos ON turnos;
        CREATE TRIGGER trigger_auditoria_turnos
        AFTER UPDATE OR DELETE ON turnos
        FOR EACH ROW
        EXECUTE FUNCTION funcion_auditar_turnos();
        """
        connection.execute(text(trigger_sql))
        connection.commit()
            
    print("✅ Particiones y Auditoría creadas exitosamente.")
    db = SessionLocal()

    try:
        # --- NUEVO: CARGA DEL PADRÓN DE OBRAS SOCIALES ---
        print("Cargando el padrón de Obras Sociales y Prepagas...")
        obras_data = [
            {"nombre": "OSDE", "cobertura": 15000.00},
            {"nombre": "PAMI", "cobertura": 8000.00},
            {"nombre": "Swiss Medical", "cobertura": 12000.00}
        ]
        db_obras = []
        for os_data in obras_data:
            obra = models.ObraSocial(nombre=os_data["nombre"], cobertura_base=os_data["cobertura"])
            db.add(obra)
            db_obras.append(obra)
        db.commit()

        # 1. Crear especialidades
        print("Inyectando 5 especialidades médicas...")
        nombres_especialidades = ["Cardiología", "Dermatología", "Pediatría", "Traumatología", "Neurología"]
        db_especialidades = []
        for nombre in nombres_especialidades:
            especialidad = models.Especialidad(nombre=nombre)
            db.add(especialidad)
            db_especialidades.append(especialidad)
        db.commit()

        # 2. Crear médicos
        print("Contratando 15 médicos aleatorios...")
        for _ in range(15):
            medico = models.Medico(
                nombre=fake.first_name(),
                apellido=fake.last_name(),
                matricula=f"MP-{fake.unique.random_int(min=10000, max=99999)}",
                especialidad_id=random.choice(db_especialidades).id
            )
            db.add(medico)
        db.commit()

        # 3. Crear pacientes
        print("Recibiendo 10.000 pacientes en la sala de espera...")

        # Generamos 10.000 DNIS unicos y garantizados antes del bucle
        dnis_unicos = random.sample(range(10000000, 47000000), 10000)

        for i in range(10000):
            # Guardamos los nombres generados
            nombre_generado = fake.first_name()
            apellido_generado = fake.last_name()

            # Limpiamos tildes y espacios para el email
            nombre_limpio = ''.join(c for c in unicodedata.normalize('NFD', nombre_generado) if unicodedata.category(c) != 'Mn').replace(' ', '').lower()
            apellido_limpio = ''.join(c for c in unicodedata.normalize('NFD', apellido_generado) if unicodedata.category(c) != 'Mn').replace(' ', '').lower()

            # Armamos el email personalizado agregando un numero random para evitar duplicados
            email_personalizado = f"{nombre_limpio}.{apellido_limpio}{random.randint(10, 999)}@example.com"

            # Sacamos un DNI de nuestra lista de numeros unicos usando el indice del bucle
            dni_realista = str(dnis_unicos[i])

            # --- NUEVO: ASIGNACIÓN DE COBERTURA MÉDICA ---
            # Le damos un 70% de chance de tener obra social, y 30% de ser particular
            tiene_obra_social = random.random() < 0.7
            obra_asignada = random.choice(db_obras).id if tiene_obra_social else None
            credencial_falsa = f"{random.randint(100000, 999999)}-{random.randint(0, 9)}" if tiene_obra_social else None

            paciente = models.Paciente(
                nombre=nombre_generado,
                apellido=apellido_generado,
                dni=dni_realista,
                email=email_personalizado,
                telefono=fake.phone_number(),
                obra_social_id=obra_asignada,
                numero_credencial=credencial_falsa
            )
            db.add(paciente)
        db.commit()
        print("✅¡Restauración completa, la base de datos está lista para usar!")
    
    except Exception as e:
        print("Ocurrió un error durante la restauración:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    restaurar_base_de_datos()