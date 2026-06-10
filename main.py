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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

@app.get("/ping")
def ping():
    return {"message": "El servidor está funcionando correctamente."}

# --- RUTAS DE OBRAS SOCIALES ---
@app.get("/obras-sociales/", response_model=List[schemas.ObraSocial])
def obtener_obras_sociales(db: Session = Depends(get_db)):
    # Devuelve la lista de obras sociales cargadas en sistema
    return db.query(models.ObraSocial).order_by(asc(models.ObraSocial.id)).all()

# --- RUTAS PARA PACIENTES ---
@app.post("/pacientes/", response_model=schemas.Paciente)
def crear_paciente(paciente: schemas.PacienteCreate, db: Session = Depends(get_db)):
    db_paciente = db.query(models.Paciente).filter(models.Paciente.dni == paciente.dni).first()
    if db_paciente:
        raise HTTPException(status_code=400, detail="Ya existe un paciente con ese DNI")
    
    nuevo_paciente = models.Paciente(
        nombre=paciente.nombre,
        apellido=paciente.apellido,
        dni=paciente.dni,
        email=paciente.email,
        telefono=paciente.telefono,
        obra_social_id=paciente.obra_social_id,
        numero_credencial=paciente.numero_credencial
    )

    db.add(nuevo_paciente)
    db.commit()
    db.refresh(nuevo_paciente) 
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
    db_paciente.obra_social_id = paciente_actualizado.obra_social_id
    db_paciente.numero_credencial = paciente_actualizado.numero_credencial
    
    db.commit()
    db.refresh(db_paciente)
    return db_paciente

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
    medicos = db.query(models.Medico).order_by(asc(models.Medico.id)).all()
    return medicos

@app.put("/medicos/{medico_id}", response_model=schemas.Medico)
def actualizar_medico(medico_id: int, medico_actualizado: schemas.MedicoCreate, db: Session = Depends(get_db)):
    db_medico = db.query(models.Medico).filter(models.Medico.id == medico_id).first()
    
    if not db_medico:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    
    db_medico.nombre = medico_actualizado.nombre
    db_medico.apellido = medico_actualizado.apellido
    db_medico.matricula = medico_actualizado.matricula
    db_medico.especialidad_id = medico_actualizado.especialidad_id
    
    db.commit()
    db.refresh(db_medico)
    
    return db_medico

@app.delete("/medicos/{medico_id}")
def eliminar_medico(medico_id: int, db: Session = Depends(get_db)):
    db_medico = db.query(models.Medico).filter(models.Medico.id == medico_id).first()
    
    if not db_medico:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    
    db.delete(db_medico)
    db.commit()
    
    return {"mensaje": f"Médico {db_medico.nombre} {db_medico.apellido} eliminado correctamente"}

# --- RUTAS DE TURNOS ---
@app.post("/turnos/", response_model=schemas.Turno, status_code=status.HTTP_201_CREATED)
def crear_turno_seguro(turno: schemas.TurnoCreate, db: Session = Depends(get_db)):
    try:
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
        
        # --- LÓGICA FINANCIERA: Buscar cobertura de Obra Social ---
        paciente_db = db.query(models.Paciente).filter(models.Paciente.id == turno.paciente_id).first()
        cobertura = 0.00
        if paciente_db and paciente_db.obra_social_id:
            obra_social = db.query(models.ObraSocial).filter(models.ObraSocial.id == paciente_db.obra_social_id).first()
            if obra_social:
                cobertura = obra_social.cobertura_base

        nuevo_turno = models.Turno(
            fecha=turno.fecha,
            medico_id=turno.medico_id,
            paciente_id=turno.paciente_id,
            motivo=turno.motivo,
            monto_obra_social=cobertura # Se asigna automáticamente lo que cubre la OS
        )
        
        db.add(nuevo_turno)
        db.commit()
        db.refresh(nuevo_turno)
        return nuevo_turno

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        db.rollback() 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error transaccional al reservar el turno: {str(e)}"
        )

@app.get("/turnos/", response_model=List[schemas.Turno])
def obtener_turnos(db: Session = Depends(get_db)):
    turnos = db.query(models.Turno).all()
    return turnos

@app.delete("/turnos/{turno_id}")
def eliminar_turno(turno_id: int, db: Session = Depends(get_db)):
    db_turno = db.query(models.Turno).filter(models.Turno.id == turno_id).first()
    
    if not db_turno:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    
    db.delete(db_turno)
    db.commit()
    
    return {"mensaje": "Turno cancelado y liberado correctamente"}

@app.put("/turnos/{turno_id}", response_model=schemas.Turno)
def actualizar_turno(turno_id: int, turno_actualizado: schemas.TurnoUpdate, db: Session = Depends(get_db)):
    db_turno = db.query(models.Turno).filter(models.Turno.id == turno_id).first()
    
    if not db_turno:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    
    if turno_actualizado.estado is not None:
        db_turno.estado = turno_actualizado.estado
    if turno_actualizado.notas is not None:
        db_turno.notas = turno_actualizado.notas
        
    # Nueva actualización financiera (Para cuando el recepcionista cobra en ventanilla)
    if turno_actualizado.monto_copago is not None:
        db_turno.monto_copago = turno_actualizado.monto_copago
        
    db.commit()
    db.refresh(db_turno)
    
    return db_turno

# --- RUTAS DE HISTORIAS CLINICAS ---
@app.post("/historias_clinicas/", response_model=schemas.HistoriaClinica, status_code=status.HTTP_201_CREATED)
def crear_historia_clinica(historia: schemas.HistoriaClinicaCreate, db: Session = Depends(get_db)):
    nueva_historia = models.HistoriaClinica(
        paciente_id=historia.paciente_id,
        medico_id=historia.medico_id,
        datos_medicos=historia.datos_medicos
    )
    db.add(nueva_historia)
    db.commit()
    db.refresh(nueva_historia)
    return nueva_historia

@app.post("/historias-clinicas/", response_model=schemas.HistoriaClinica)
def crear_registro_historia(registro: schemas.HistoriaClinicaCreate, db: Session = Depends(get_db)):
    paciente = db.query(models.Paciente).filter(models.Paciente.id == registro.paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
    medico = db.query(models.Medico).filter(models.Medico.id == registro.medico_id).first()
    if not medico:
        raise HTTPException(status_code=404, detail="Médico no encontrado")

    db_registro = models.HistoriaClinica(
        paciente_id=registro.paciente_id,
        medico_id=registro.medico_id,
        datos_medicos=registro.datos_medicos, 
        fecha=datetime.now()
    )
    
    db.add(db_registro)
    db.commit()
    db.refresh(db_registro)
    return db_registro

@app.get("/historias-clinicas/paciente/{paciente_id}", response_model=List[schemas.HistoriaClinica])
def obtener_historial_paciente(paciente_id: int, db: Session = Depends(get_db)):
    historial = db.query(models.HistoriaClinica)\
                  .filter(models.HistoriaClinica.paciente_id == paciente_id)\
                  .order_by(models.HistoriaClinica.fecha.desc())\
                  .all()
    return historial

@app.get("/estadisticas/turnos-por-medico", tags=["Administracion"])
def obtener_estadisticas_turnos(db: Session = Depends(get_db)):
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
    resultado = db.execute(text(consulta_sql))
    estadisticas = resultado.mappings().all()

    return {
        "mensaje": "Estadisticas calculadas via Raw SQL",
        "data": estadisticas
    }