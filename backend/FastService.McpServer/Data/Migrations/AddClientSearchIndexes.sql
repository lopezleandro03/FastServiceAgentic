-- Performance indexes for client and order search functionality
-- Run this script on the FastService database to improve search speed

-- ============================================================================
-- CLIENTE TABLE INDEXES
-- ============================================================================

-- Index on Nombre (first name) for text search
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Cliente_Nombre' AND object_id = OBJECT_ID('dbo.Cliente'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Cliente_Nombre 
    ON dbo.Cliente (Nombre)
    INCLUDE (Apellido, Dni, Telefono1, Telefono2, Mail, Direccion, Localidad);
    PRINT 'Created index IX_Cliente_Nombre';
END
ELSE
    PRINT 'Index IX_Cliente_Nombre already exists';
GO

-- Index on Apellido (last name) for text search  
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Cliente_Apellido' AND object_id = OBJECT_ID('dbo.Cliente'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Cliente_Apellido 
    ON dbo.Cliente (Apellido)
    INCLUDE (Nombre, Dni, Telefono1, Telefono2, Mail, Direccion, Localidad);
    PRINT 'Created index IX_Cliente_Apellido';
END
ELSE
    PRINT 'Index IX_Cliente_Apellido already exists';
GO

-- Index on DNI for exact lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Cliente_Dni' AND object_id = OBJECT_ID('dbo.Cliente'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Cliente_Dni 
    ON dbo.Cliente (Dni)
    WHERE Dni IS NOT NULL;
    PRINT 'Created index IX_Cliente_Dni';
END
ELSE
    PRINT 'Index IX_Cliente_Dni already exists';
GO

-- Index on Direccion (address) for text search
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Cliente_Direccion' AND object_id = OBJECT_ID('dbo.Cliente'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Cliente_Direccion 
    ON dbo.Cliente (Direccion)
    INCLUDE (ClienteId, Nombre, Apellido, Localidad);
    PRINT 'Created index IX_Cliente_Direccion';
END
ELSE
    PRINT 'Index IX_Cliente_Direccion already exists';
GO

-- Index on Localidad (city/locality) for text search
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Cliente_Localidad' AND object_id = OBJECT_ID('dbo.Cliente'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Cliente_Localidad 
    ON dbo.Cliente (Localidad)
    INCLUDE (ClienteId, Nombre, Apellido, Direccion)
    WHERE Localidad IS NOT NULL;
    PRINT 'Created index IX_Cliente_Localidad';
END
ELSE
    PRINT 'Index IX_Cliente_Localidad already exists';
GO

-- ============================================================================
-- REPARACION TABLE INDEXES (Critical for order search performance)
-- ============================================================================

-- Primary index: ClienteId + CreadoEn for customer order lookups and counts
-- Covers: COUNT by ClienteId, MAX(CreadoEn) by ClienteId, order history queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reparacion_ClienteId_CreadoEn' AND object_id = OBJECT_ID('dbo.Reparacion'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Reparacion_ClienteId_CreadoEn 
    ON dbo.Reparacion (ClienteId, CreadoEn DESC)
    INCLUDE (EstadoReparacionId, MarcaId, TipoDispositivoId, TecnicoAsignadoId, FechaEntrega);
    PRINT 'Created index IX_Reparacion_ClienteId_CreadoEn';
END
ELSE
    PRINT 'Index IX_Reparacion_ClienteId_CreadoEn already exists';
GO

-- Index for date-based searches (common filter: orders by date range)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reparacion_CreadoEn_Desc' AND object_id = OBJECT_ID('dbo.Reparacion'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Reparacion_CreadoEn_Desc 
    ON dbo.Reparacion (CreadoEn DESC)
    INCLUDE (ClienteId, EstadoReparacionId, MarcaId, TipoDispositivoId);
    PRINT 'Created index IX_Reparacion_CreadoEn_Desc';
END
ELSE
    PRINT 'Index IX_Reparacion_CreadoEn_Desc already exists';
GO

-- Index for status-based searches (filter by EstadoReparacionId)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reparacion_EstadoReparacionId' AND object_id = OBJECT_ID('dbo.Reparacion'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Reparacion_EstadoReparacionId 
    ON dbo.Reparacion (EstadoReparacionId)
    INCLUDE (ClienteId, CreadoEn, MarcaId, TipoDispositivoId, FechaEntrega);
    PRINT 'Created index IX_Reparacion_EstadoReparacionId';
END
ELSE
    PRINT 'Index IX_Reparacion_EstadoReparacionId already exists';
GO

-- Index for brand-based searches
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reparacion_MarcaId' AND object_id = OBJECT_ID('dbo.Reparacion'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Reparacion_MarcaId 
    ON dbo.Reparacion (MarcaId)
    INCLUDE (ClienteId, CreadoEn, EstadoReparacionId, TipoDispositivoId);
    PRINT 'Created index IX_Reparacion_MarcaId';
END
ELSE
    PRINT 'Index IX_Reparacion_MarcaId already exists';
GO

-- Index for device type searches
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reparacion_TipoDispositivoId' AND object_id = OBJECT_ID('dbo.Reparacion'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Reparacion_TipoDispositivoId 
    ON dbo.Reparacion (TipoDispositivoId)
    INCLUDE (ClienteId, CreadoEn, EstadoReparacionId, MarcaId);
    PRINT 'Created index IX_Reparacion_TipoDispositivoId';
END
ELSE
    PRINT 'Index IX_Reparacion_TipoDispositivoId already exists';
GO

-- Index for technician assignment lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reparacion_TecnicoAsignadoId' AND object_id = OBJECT_ID('dbo.Reparacion'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Reparacion_TecnicoAsignadoId 
    ON dbo.Reparacion (TecnicoAsignadoId)
    INCLUDE (ClienteId, CreadoEn, EstadoReparacionId)
    WHERE TecnicoAsignadoId IS NOT NULL;
    PRINT 'Created index IX_Reparacion_TecnicoAsignadoId';
END
ELSE
    PRINT 'Index IX_Reparacion_TecnicoAsignadoId already exists';
GO

-- Composite index for common multi-filter queries: Status + Date
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reparacion_Estado_CreadoEn' AND object_id = OBJECT_ID('dbo.Reparacion'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Reparacion_Estado_CreadoEn 
    ON dbo.Reparacion (EstadoReparacionId, CreadoEn DESC)
    INCLUDE (ClienteId, MarcaId, TipoDispositivoId, FechaEntrega);
    PRINT 'Created index IX_Reparacion_Estado_CreadoEn';
END
ELSE
    PRINT 'Index IX_Reparacion_Estado_CreadoEn already exists';
GO

-- ============================================================================
-- REPARACION_DETALLE TABLE INDEXES
-- ============================================================================

-- Index for model searches (common filter in order search)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ReparacionDetalle_ReparacionId' AND object_id = OBJECT_ID('dbo.ReparacionDetalle'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_ReparacionDetalle_ReparacionId 
    ON dbo.ReparacionDetalle (ReparacionId)
    INCLUDE (Modelo, Serie, Precio, EsGarantia, EsDomicilio, Presupuesto);
    PRINT 'Created index IX_ReparacionDetalle_ReparacionId';
END
ELSE
    PRINT 'Index IX_ReparacionDetalle_ReparacionId already exists';
GO

-- ============================================================================
-- ESTADO_REPARACION TABLE INDEX (for status name lookups)
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EstadoReparacion_Nombre' AND object_id = OBJECT_ID('dbo.EstadoReparacion'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_EstadoReparacion_Nombre 
    ON dbo.EstadoReparacion (Nombre);
    PRINT 'Created index IX_EstadoReparacion_Nombre';
END
ELSE
    PRINT 'Index IX_EstadoReparacion_Nombre already exists';
GO

-- ============================================================================
-- MARCA TABLE INDEX (for brand name lookups)
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Marca_Nombre' AND object_id = OBJECT_ID('dbo.Marca'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Marca_Nombre 
    ON dbo.Marca (Nombre);
    PRINT 'Created index IX_Marca_Nombre';
END
ELSE
    PRINT 'Index IX_Marca_Nombre already exists';
GO

-- ============================================================================
-- TIPO_DISPOSITIVO TABLE INDEX (for device type name lookups)
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TipoDispositivo_Nombre' AND object_id = OBJECT_ID('dbo.TipoDispositivo'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_TipoDispositivo_Nombre 
    ON dbo.TipoDispositivo (Nombre);
    PRINT 'Created index IX_TipoDispositivo_Nombre';
END
ELSE
    PRINT 'Index IX_TipoDispositivo_Nombre already exists';
GO

PRINT '';
PRINT '============================================================================';
PRINT 'Client and Order search indexes setup complete!';
PRINT '============================================================================';
PRINT '';
PRINT 'Indexes created for optimizing:';
PRINT '  - Client name/surname fuzzy search';
PRINT '  - Client DNI exact lookup';
PRINT '  - Order count and last order date per client';
PRINT '  - Order search by date range';
PRINT '  - Order search by status';
PRINT '  - Order search by brand/device type';
PRINT '  - Order search by technician';
PRINT '  - Model search in order details';
PRINT '';
