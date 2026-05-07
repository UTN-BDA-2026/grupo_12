-- public.categorias definition

-- Drop table

-- DROP TABLE public.categorias;

CREATE TABLE public.categorias (
	id_categoria serial4 NOT NULL,
	nombre varchar(100) NOT NULL,
	CONSTRAINT categorias_nombre_key UNIQUE (nombre),
	CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria)
);


-- public.clientes definition

-- Drop table

-- DROP TABLE public.clientes;

CREATE TABLE public.clientes (
	id_cliente serial4 NOT NULL,
	nombre_completo varchar(200) NOT NULL,
	email varchar(150) NULL,
	telefono varchar(50) NULL,
	CONSTRAINT clientes_email_key UNIQUE (email),
	CONSTRAINT clientes_pkey PRIMARY KEY (id_cliente)
);


-- public.marcas definition

-- Drop table

-- DROP TABLE public.marcas;

CREATE TABLE public.marcas (
	id_marca serial4 NOT NULL,
	nombre varchar(100) NOT NULL,
	CONSTRAINT marcas_nombre_key UNIQUE (nombre),
	CONSTRAINT marcas_pkey PRIMARY KEY (id_marca)
);


-- public.productos definition

-- Drop table

-- DROP TABLE public.productos;

CREATE TABLE public.productos (
	id_producto serial4 NOT NULL,
	nombre varchar(200) NOT NULL,
	id_categoria int4 NULL,
	id_marca int4 NULL,
	precio_actual numeric(10, 2) NOT NULL,
	stock_actual int4 DEFAULT 0 NOT NULL,
	CONSTRAINT nombre_producto_unico UNIQUE (nombre),
	CONSTRAINT nombre_unico UNIQUE (nombre),
	CONSTRAINT productos_pkey PRIMARY KEY (id_producto),
	CONSTRAINT productos_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria),
	CONSTRAINT productos_id_marca_fkey FOREIGN KEY (id_marca) REFERENCES public.marcas(id_marca)
);


-- public.ventas definition

-- Drop table

-- DROP TABLE public.ventas;

CREATE TABLE public.ventas (
	id_venta serial4 NOT NULL,
	id_cliente int4 NULL,
	fecha_venta timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	total_venta numeric(10, 2) DEFAULT 0.00 NULL,
	CONSTRAINT ventas_pkey PRIMARY KEY (id_venta),
	CONSTRAINT ventas_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente)
);
CREATE INDEX idx_ventas_fecha ON public.ventas USING btree (fecha_venta);


-- public.detalles_venta definition

-- Drop table

-- DROP TABLE public.detalles_venta;

CREATE TABLE public.detalles_venta (
	id_detalle serial4 NOT NULL,
	id_venta int4 NULL,
	id_producto int4 NULL,
	cantidad int4 NOT NULL,
	precio_unitario numeric(10, 2) NOT NULL,
	CONSTRAINT detalles_venta_cantidad_check CHECK ((cantidad > 0)),
	CONSTRAINT detalles_venta_pkey PRIMARY KEY (id_detalle),
	CONSTRAINT detalles_venta_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto),
	CONSTRAINT detalles_venta_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES public.ventas(id_venta) ON DELETE CASCADE
);

-- Table Triggers

create trigger trigger_restar_stock after
insert
    on
    public.detalles_venta for each row execute function actualizar_stock();