import random
import unicodedata
import os
from faker import Faker
from app.database import engine, SessionLocal
from app import models
from sqlalchemy import text

# Inicializamos Faker con localizacion argentina para mayor realismo
fake = Faker('es_AR')

# -- Nuevo: CONGELAR EL AZAR PARA QUE SEA IGUAL PARA TODOS --
Faker.seed(1234)
random.seed(1234)

def restaurar_base_de_datos():
    print("Borrando tablas existentes para limpiar el lienzo...")
    models.Base.metadata.drop_all(bind=engine)
    print("Creando las tablas nuevamente desde cero...")
    models.Base.metadata.create_all(bind=engine)

    # --- Ejecutar script de particiones ---
    print("Construyendo las particiones para la tabla de turnos...")

    # 1. Encontrar la ruta absoluta al script sql
    script_path = os.path.join(os.path.dirname(__file__), 'sql', '01_init_particiones_turnos.sql')

    # 2. Leer y ejecutar el sql directamente en la base de datos
    with engine.connect() as connection:
        with open(script_path, 'r') as file:            
            query_sql = file.read()
            connection.execute(text(query_sql))
            connection.commit()
    print("✅ Particiones mensuales creadas exitosamente.")
    db = SessionLocal()

    try:
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

            paciente = models.Paciente(
                nombre=nombre_generado,
                apellido=apellido_generado,
                dni=dni_realista,
                email=email_personalizado,
                telefono=fake.phone_number()
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