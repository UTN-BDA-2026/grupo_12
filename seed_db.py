import random
import unicodedata
from faker import Faker
from app.database import engine, SessionLocal
from app import models

# Inicializamos Faker con localizacion argentina para mayor realismo
fake = Faker('es_AR')
def restaurar_base_de_datos():
    print("Borrando tablas existentes para limpiar el lienzo...")
    models.Base.metadata.drop_all(bind=engine)
    print("Creando las tablas nuevamente desde cero...")
    models.Base.metadata.create_all(bind=engine)
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
        print("Recibiendo 100 pacientes en la sala de espera...")
        for _ in range(100):
            # Guardamos los nombres generados
            nombre_generado = fake.first_name()
            apellido_generado = fake.last_name()

            # Limpiamos tildes y espacios para el email
            nombre_limpio = ''.join(c for c in unicodedata.normalize('NFD', nombre_generado) if unicodedata.category(c) != 'Mn').replace(' ', '').lower()
            apellido_limpio = ''.join(c for c in unicodedata.normalize('NFD', apellido_generado) if unicodedata.category(c) != 'Mn').replace(' ', '').lower()

            # Armamos el email personalizado agregando un numero random para evitar duplicados
            email_personalizado = f"{nombre_limpio}.{apellido_limpio}{random.randint(10, 99)}@example.com"

            # Generamos un DNI realista para Argentina
            dni_realista = str(random.randint(10000000, 47000000))

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