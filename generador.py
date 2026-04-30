import psycopg2
from psycopg2.extras import execute_values
import random
from datetime import datetime, timedelta

# Conexión a tu base de datos local (sin contraseña)
conn = psycopg2.connect(
    host="localhost",
    database="postgres",
    user="postgres"
)
cursor = conn.cursor()

print("⏳ Empezando a inyectar datos (esto puede tardar unos segundos)...")

try:
    # 0. INFLAR STOCK EXISTENTE
    print("🛡️ Inflando stock de los productos existentes para que el Trigger no nos bloquee...")
    cursor.execute("UPDATE productos SET stock_actual = 1000000;")

    # 1. GENERAR 5000 PRODUCTOS FALSOS
    print("📦 Generando 5000 productos falsos...")
    productos_data = []
    for i in range(1, 5001):
        cat = random.randint(1, 4)
        marca = random.randint(1, 4)
        precio = round(random.uniform(10.0, 1500.0), 2)
        productos_data.append((f"Producto_Test_{i}", cat, marca, precio, 1000000))
    
    query_prod = """
        INSERT INTO productos (nombre, id_categoria, id_marca, precio_actual, stock_actual) 
        VALUES %s ON CONFLICT DO NOTHING;
    """
    execute_values(cursor, query_prod, productos_data)
    
    # Obtener los IDs de todos los productos
    cursor.execute("SELECT id_producto, precio_actual FROM productos;")
    todos_los_productos = cursor.fetchall()
    
    # 2. GENERAR 100,000 VENTAS Y SUS DETALLES
    print("🛒 Generando 100,000 ventas... (¡Paciencia, son muchas!)")
    
    fecha_base = datetime.now() - timedelta(days=730)
    
    ventas_data = []
    for i in range(100000):
        dias_random = random.randint(0, 730)
        fecha_random = fecha_base + timedelta(days=dias_random, minutes=random.randint(0, 1440))
        ventas_data.append((1, fecha_random, 0))
    
    # Insertar ventas masivas
    cursor.execute("INSERT INTO ventas (id_cliente, fecha_venta, total_venta) VALUES " + 
                   ",".join(["(1, %s, 0)"] * 100000), 
                   [v[1] for v in ventas_data])
    
    cursor.execute("SELECT id_venta FROM ventas ORDER BY id_venta DESC LIMIT 100000;")
    ids_ventas = [row[0] for row in cursor.fetchall()]

    detalles_data = []
    for id_v in ids_ventas:
        prod_random = random.choice(todos_los_productos)
        id_p = prod_random[0]
        precio_u = prod_random[1]
        cantidad = random.randint(1, 3)
        detalles_data.append((id_v, id_p, cantidad, precio_u))
    
    print("📝 Vinculando detalles y descontando stock masivamente...")
    query_detalles = """
        INSERT INTO detalles_venta (id_venta, id_producto, cantidad, precio_unitario)
        VALUES %s;
    """
    execute_values(cursor, query_detalles, detalles_data)

    conn.commit()
    print("✅ ¡ÉXITO! Base de datos engordada y lista para el Trabajo Práctico.")

except Exception as e:
    conn.rollback()
    print(f"❌ Uf, hubo un error: {e}")

finally:
    cursor.close()
    conn.close()