from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI(title="Sistema de Hardware - Matias")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {"dbname": "postgres", "user": "postgres", "password": "", "host": "localhost", "port": "5432"}

def get_db_connection():
    try: return psycopg2.connect(**DB_CONFIG)
    except: return None

# Modelos para recibir datos
class VentaRequest(BaseModel):
    id_producto: int
    cantidad: int
    precio_unitario: float

class ProductoRequest(BaseModel):
    nombre: str
    id_categoria: int
    id_marca: int
    precio_actual: float
    stock_actual: int

@app.get("/productos")
def obtener_productos():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT p.*, c.nombre as categoria, m.nombre as marca 
        FROM productos p 
        JOIN categorias c ON p.id_categoria = c.id_categoria 
        JOIN marcas m ON p.id_marca = m.id_marca 
        ORDER BY p.id_producto DESC;
    """)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

@app.post("/productos")
def crear_producto(p: ProductoRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Usamos ON CONFLICT para sumar el stock si el nombre ya existe
        query = """
            INSERT INTO productos (nombre, id_categoria, id_marca, precio_actual, stock_actual)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (nombre) 
            DO UPDATE SET 
                stock_actual = productos.stock_actual + EXCLUDED.stock_actual,
                precio_actual = EXCLUDED.precio_actual;
        """
        cursor.execute(query, (p.nombre, p.id_categoria, p.id_marca, p.precio_actual, p.stock_actual))
        conn.commit()
        return {"mensaje": "Inventario actualizado correctamente"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close(); conn.close()

@app.post("/ventas")
def registrar_venta(v: VentaRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO ventas (id_cliente, total_venta) VALUES (1, %s) RETURNING id_venta;", (v.cantidad * v.precio_unitario,))
        id_v = cursor.fetchone()[0]
        cursor.execute("INSERT INTO detalles_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES (%s, %s, %s, %s);",
                       (id_v, v.id_producto, v.cantidad, v.precio_unitario))
        conn.commit()
        return {"mensaje": "Venta exitosa"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close(); conn.close()

@app.get("/historial")
def obtener_historial():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    # JOIN TRIPLE: El corazón de tu base de datos
    query = """
        SELECT v.id_venta, v.fecha_venta, p.nombre as producto, dv.cantidad, dv.precio_unitario, (dv.cantidad * dv.precio_unitario) as subtotal
        FROM detalles_venta dv
        JOIN ventas v ON dv.id_venta = v.id_venta
        JOIN productos p ON dv.id_producto = p.id_producto
        ORDER BY v.fecha_venta DESC;
    """
    cursor.execute(query)
    res = cursor.fetchall()
    cursor.close(); conn.close()
    return res