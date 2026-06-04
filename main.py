from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session  
from app import models, schemas
from app.database import engine, get_db
from sqlalchemy import text, asc
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Crea las tablas si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title = "Sistema de Turnos Medicos")

# --- CONFIGURACION DE CORS ---
# Esto nos permite que el front se comunique con nuestra api sin ser bloqueado.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # El puerto por defecto de Vite
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permite todas las cabeceras
)



@app.get("/ping")
def ping():
    return {"message": "El servidor está funcionando correctamente."}

# --- RUTAS PARA PACIENTES ---
@app.post("/pacientes/", response_model=schemas.Paciente)
def crear_paciente(paciente: schemas.PacienteCreate, db: Session = Depends(get_db)):
    # 1. Verificamos si ya existe alguien con ese DNI en la base
    db_paciente = db.query(models.Paciente).filter(models.Paciente.dni == paciente.dni).first()
    if db_paciente:
        raise HTTPException(status_code=400, detail="Ya existe un paciente con ese DNI")
    
    # 2. Creamos el objeto del ORM con los datos que llegaron
    nuevo_paciente = models.Paciente(
        nombre=paciente.nombre,
        apellido=paciente.apellido,
        dni=paciente.dni,
        email=paciente.email,
        telefono=paciente.telefono
    )

    # 3. Lo guardamos en PostgreSQL
    db.add(nuevo_paciente)
    db.commit()
    db.refresh(nuevo_paciente) # Actualizamos para que nos devuelva el ID autogenerado
    return nuevo_paciente

@app.get("/pacientes/", response_model=List[schemas.Paciente])
def obtener_pacientes(db: Session = Depends(get_db)):
    return db.query(models.Paciente).all()

@app.get("/pacientes/buscar/{dni}", response_model=schemas.Paciente)
def buscar_paciente_por_dni(dni: str, db: Session = Depends(get_db)):
    paciente = db.query(models.Paciente).filter(models.Paciente.dni == dni).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="No se encontró ningún paciente con ese DNI")
    return paciente

# Editar paciente
@app.put("/pacientes/{paciente_id}", response_model=schemas.Paciente)
def actualizar_paciente(paciente_id: int, paciente_actualizado: schemas.PacienteCreate, db: Session = Depends(get_db)):
    db_paciente = db.query(models.Paciente).filter(models.Paciente.id == paciente_id).first()
    if not db_paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    db_paciente.nombre = paciente_actualizado.nombre
    db_paciente.apellido = paciente_actualizado.apellido
    db_paciente.dni = paciente_actualizado.dni
    db_paciente.email = paciente_actualizado.email
    db_paciente.telefono = paciente_actualizado.telefono
    
    db.commit()
    db.refresh(db_paciente)
    return db_paciente

# Eliminar paciente
@app.delete("/pacientes/{paciente_id}")
def eliminar_paciente(paciente_id: int, db: Session = Depends(get_db)):
    db_paciente = db.query(models.Paciente).filter(models.Paciente.id == paciente_id).first()
    if not db_paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    db.delete(db_paciente)
    db.commit()
    return {"mensaje": "Paciente eliminado correctamente"}

# --- RUTAS DE ESPECIALIDADES ---
@app.post("/especialidades/", response_model=schemas.Especialidad)
def crear_especialidad(especialidad: schemas.EspecialidadCreate, db: Session = Depends(get_db)):
    db_especialidad = db.query(models.Especialidad).filter(models.Especialidad.nombre == especialidad.nombre).first()
    if db_especialidad:
        raise HTTPException(status_code=400, detail="Ya existe una especialidad con ese nombre")
    
    nueva_especialidad = models.Especialidad(nombre=especialidad.nombre)
    db.add(nueva_especialidad)
    db.commit()
    db.refresh(nueva_especialidad)
    return nueva_especialidad

@app.get("/especialidades/", response_model=List[schemas.Especialidad])
def obtener_especialidades(db: Session = Depends(get_db)):
    return db.query(models.Especialidad).all()  

# --- RUTAS DE MEDICOS ---
@app.post("/medicos/", response_model=schemas.Medico)
def crear_medico(medico: schemas.MedicoCreate, db: Session = Depends(get_db)):
    db_medico = db.query(models.Medico).filter(models.Medico.matricula == medico.matricula).first()
    if db_medico:
        raise HTTPException(status_code=400, detail="Ya existe un medico con esa matricula")

    nuevo_medico = models.Medico(
        nombre=medico.nombre,
        apellido=medico.apellido,
        matricula=medico.matricula,
        especialidad_id=medico.especialidad_id
    )
    db.add(nuevo_medico)
    db.commit()
    db.refresh(nuevo_medico)
    return nuevo_medico

@app.get("/medicos/", response_model=List[schemas.Medico])
def obtener_medicos(db: Session = Depends(get_db)):
    # Modificamos la consulta para que PostgreSQL siempre ordene por ID antes de mandar los datos
    medicos = db.query(models.Medico).order_by(asc(models.Medico.id)).all()
    return medicos

# --- EDITAR MÉDICO (PUT) ---
@app.put("/medicos/{medico_id}", response_model=schemas.Medico)
def actualizar_medico(medico_id: int, medico_actualizado: schemas.MedicoCreate, db: Session = Depends(get_db)):
    # 1. Buscamos si el médico existe en la base de datos
    db_medico = db.query(models.Medico).filter(models.Medico.id == medico_id).first()
    
    if not db_medico:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    
    # 2. Actualizamos los datos
    db_medico.nombre = medico_actualizado.nombre
    db_medico.apellido = medico_actualizado.apellido
    db_medico.matricula = medico_actualizado.matricula
    db_medico.especialidad_id = medico_actualizado.especialidad_id
    
    # 3. Guardamos los cambios
    db.commit()
    db.refresh(db_medico)
    
    return db_medico


# --- ELIMINAR MÉDICO (DELETE) ---
@app.delete("/medicos/{medico_id}")
def eliminar_medico(medico_id: int, db: Session = Depends(get_db)):
    # 1. Buscamos al médico
    db_medico = db.query(models.Medico).filter(models.Medico.id == medico_id).first()
    
    if not db_medico:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    
    # 2. Lo eliminamos físicamente de la base de datos
    db.delete(db_medico)
    db.commit()
    
    return {"mensaje": f"Médico {db_medico.nombre} {db_medico.apellido} eliminado correctamente"}

# --- RUTAS DE TURNOS ---
@app.post("/turnos/", response_model=schemas.Turno, status_code=status.HTTP_201_CREATED)
def crear_turno_seguro(turno: schemas.TurnoCreate, db: Session = Depends(get_db)):

    # Registra un turno medico de forma transaccional segura, previniendo double-booking mediante bloqueos pesimistas.
    try:
        # 1. INICIO DE LA VERIFICACION DE LOCK (with_for_update)
        # Buscamos si ya existe un turno para ese medico en esa fecha/hora exacta.
        # .with_for_update() bloquea la fila en la base de datos hasta el commit/rollback.
        turno_existente = db.query(models.Turno)\
            .filter(
                models.Turno.medico_id == turno.medico_id,
                models.Turno.fecha == turno.fecha
            )\
            .with_for_update().first()
        
        if turno_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El médico ya tiene un turno registrado para esa fecha y hora seleccionada."
            )
        
        # Verificamos que el paciente no tenga otro turno para esa fecha/hora (opcional, dependiendo de las reglas del negocio)
        paciente_ocupado = db.query(models.Turno)\
            .filter(
                models.Turno.paciente_id == turno.paciente_id,
                models.Turno.fecha == turno.fecha
            ).first()
        if paciente_ocupado:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El paciente ya tiene un turno registrado para esa fecha y hora seleccionada."
            )
        
        # 2. Creacion del registro
        nuevo_turno = models.Turno(
            fecha=turno.fecha,
            medico_id=turno.medico_id,
            paciente_id=turno.paciente_id,
            motivo=turno.motivo
        )
        
        db.add(nuevo_turno)

        # 3. COMMIT ATOMICO
        # Al hacer commit, se guardan los datos en la particion correspondiente y se liberan los locks.
        db.commit()
        db.refresh(nuevo_turno)
        return nuevo_turno

    except HTTPException as http_ex:
        # Si es un error controlado por nosotros, relanzamos la excepcion
        raise http_ex
    except Exception as e:
        # Si ocurre un error inesperado de base de datos (ej: caida de conexion)
        # Aseguramos el rollback inmediato para liberar cualquier lock y no dejar datos corruptos.
        db.rollback()  # En caso de error, revertimos cualquier cambio
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error transaccional al reservar el turno: {str(e)}"
        )

# Obtener los turnos
@app.get("/turnos/", response_model=List[schemas.Turno])
def obtener_turnos(db: Session = Depends(get_db)):
    # Buscamos todos los turnos en la base de datos
    turnos = db.query(models.Turno).all()
    return turnos

# Cancelar un turno
@app.delete("/turnos/{turno_id}")
def eliminar_turno(turno_id: int, db: Session = Depends(get_db)):
    # 1. Buscamos el turno
    db_turno = db.query(models.Turno).filter(models.Turno.id == turno_id).first()
    
    if not db_turno:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    
    # 2. Lo eliminamos físicamente
    db.delete(db_turno)
    db.commit()
    
    return {"mensaje": "Turno cancelado y liberado correctamente"}
    
# --- RUTAS DE HISTORIAS CLINICAS ---
@app.post("/historias_clinicas/", response_model=schemas.HistoriaClinica, status_code=status.HTTP_201_CREATED)
def crear_historia_clinica(historia: schemas.HistoriaClinicaCreate, db: Session = Depends(get_db)):
    # Registra una entrada en la historia clinica del paciente utilizando un campo JSONB (NoSQL) para soportar esquemas dinamicos dependiendo de la especialidad.
    nueva_historia = models.HistoriaClinica(
        paciente_id=historia.paciente_id,
        medico_id=historia.medico_id,
        datos_medicos=historia.datos_medicos
    )
    db.add(nueva_historia)
    db.commit()
    db.refresh(nueva_historia)
    return nueva_historia

# --- CREAR REGISTRO EN HISTORIA CLÍNICA (POST) ---
@app.post("/historias-clinicas/", response_model=schemas.HistoriaClinica)
def crear_registro_historia(registro: schemas.HistoriaClinicaCreate, db: Session = Depends(get_db)):
    # 1. Validamos que el paciente exista
    paciente = db.query(models.Paciente).filter(models.Paciente.id == registro.paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
    # 2. Validamos que el médico exista
    medico = db.query(models.Medico).filter(models.Medico.id == registro.medico_id).first()
    if not medico:
        raise HTTPException(status_code=404, detail="Médico no encontrado")

    # 3. Creamos el registro con la fecha y hora actual del servidor
    db_registro = models.HistoriaClinica(
        paciente_id=registro.paciente_id,
        medico_id=registro.medico_id,
        datos_medicos=registro.datos_medicos, # SQLAlchemy mapea el Dict automáticamente a JSONB
        fecha=datetime.now()
    )
    
    db.add(db_registro)
    db.commit()
    db.refresh(db_registro)
    return db_registro


# --- OBTENER HISTORIAL DE UN PACIENTE (GET) ---
@app.get("/historias-clinicas/paciente/{paciente_id}", response_model=List[schemas.HistoriaClinica])
def obtener_historial_paciente(paciente_id: int, db: Session = Depends(get_db)):
    # Buscamos todas las consultas del paciente ordenadas de la más reciente a la más antigua
    historial = db.query(models.HistoriaClinica)\
                  .filter(models.HistoriaClinica.paciente_id == paciente_id)\
                  .order_by(models.HistoriaClinica.fecha.desc())\
                  .all()
    return historial

# --- RUTA DE REPORTE DE ESTADISTICAS ---
@app.get("/estadisticas/turnos-por-medico", tags=["Administracion"])
def obtener_estadisticas_turnos(db: Session = Depends(get_db)):
    # Endpoint analitico para uso administrativo. Ejecuta una consulta sql nativa saltandose el orm para optimizar el rendimiento al calcular estadisticas masivas.
    # Escribimos la consulta sql pura
    # Usamos left join para que tambien aparezcan los medicos que tienen 0 turnos.
    consulta_sql = """
        SELECT
            m.matricula,
            m.nombre,
            m.apellido,
            COUNT(t.id) AS cantidad_turnos
        FROM medicos m
        LEFT JOIN turnos t ON m.id = t.medico_id
        GROUP BY m.id, m.matricula, m.nombre, m.apellido
        ORDER BY cantidad_turnos DESC;
    """

    # Ejecutamos el sql directamente contra el motor
    # El .mappings().all() convierte el resultado crudo en diccionarios
    resultado = db.execute(text(consulta_sql))
    estadisticas = resultado.mappings().all()

    return {
        "mensaje": "Estadisticas calculadas via Raw SQL",
        "data": estadisticas
    }