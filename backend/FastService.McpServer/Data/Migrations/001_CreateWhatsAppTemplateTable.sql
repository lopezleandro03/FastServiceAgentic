-- WhatsApp Template table for storing message templates
-- Migration script for WhatsApp integration feature

-- Drop and recreate table to fix encoding issues (use with caution in production)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[WhatsAppTemplate]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[WhatsAppTemplate];
    PRINT 'Dropped existing WhatsAppTemplate table';
END
GO

-- Create the WhatsAppTemplate table with NVARCHAR for proper Unicode support
CREATE TABLE [dbo].[WhatsAppTemplate] (
    [WhatsAppTemplateId] INT IDENTITY(1,1) NOT NULL,
    [Nombre] NVARCHAR(100) NOT NULL,
    [Descripcion] NVARCHAR(500) NULL,
    [EstadoReparacionId] INT NULL,
    [TipoTemplate] VARCHAR(50) NOT NULL DEFAULT 'estado',
    [Mensaje] NVARCHAR(2000) NOT NULL,
    [Activo] BIT NOT NULL DEFAULT 1,
    [Orden] INT NOT NULL DEFAULT 0,
    [EsDefault] BIT NOT NULL DEFAULT 0,
    [CreadoEn] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    [CreadoPor] INT NULL,
    [ModificadoEn] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    [ModificadoPor] INT NULL,
    CONSTRAINT [pk_WhatsAppTemplateId] PRIMARY KEY CLUSTERED ([WhatsAppTemplateId] ASC),
    CONSTRAINT [FK_WhatsAppTemplate_EstadoReparacion] FOREIGN KEY ([EstadoReparacionId]) 
        REFERENCES [dbo].[EstadoReparacion] ([EstadoReparacionId]) ON DELETE SET NULL
);
PRINT 'Created WhatsAppTemplate table with NVARCHAR columns';
GO

-- Create index on EstadoReparacionId for faster lookups
CREATE NONCLUSTERED INDEX [IX_WhatsAppTemplate_EstadoReparacionId] 
ON [dbo].[WhatsAppTemplate] ([EstadoReparacionId] ASC)
WHERE [EstadoReparacionId] IS NOT NULL;
PRINT 'Created index IX_WhatsAppTemplate_EstadoReparacionId';
GO

-- Create index on TipoTemplate for filtering
SET QUOTED_IDENTIFIER ON;
GO
CREATE NONCLUSTERED INDEX [IX_WhatsAppTemplate_TipoTemplate] 
ON [dbo].[WhatsAppTemplate] ([TipoTemplate] ASC, [Activo] ASC);
PRINT 'Created index IX_WhatsAppTemplate_TipoTemplate';
GO

-- Insert default templates based on WHATSAPP.MD
-- First, get the EstadoReparacionIds for each state
-- NOTE: Using ASCII-safe characters to avoid encoding issues with sqlcmd

DECLARE @PresupuestadoId INT = (SELECT TOP 1 EstadoReparacionId FROM EstadoReparacion WHERE Nombre LIKE N'%Presupuest%' AND Activo = 1);
DECLARE @ReparadoId INT = (SELECT TOP 1 EstadoReparacionId FROM EstadoReparacion WHERE Nombre LIKE N'%Reparado%' AND Activo = 1);
DECLARE @RechazadoId INT = (SELECT TOP 1 EstadoReparacionId FROM EstadoReparacion WHERE Nombre LIKE N'%Rechaz%' AND Activo = 1);

-- Insert Presupuestado template
INSERT INTO [dbo].[WhatsAppTemplate] (Nombre, Descripcion, EstadoReparacionId, TipoTemplate, Mensaje, Activo, Orden, EsDefault)
VALUES (
    N'Presupuestado',
    N'Mensaje para informar el presupuesto de reparacion al cliente',
    @PresupuestadoId,
    'estado',
    N'Buenos dias! Me comunico de Fast Service para pasarle el presupuesto correspondiente al TICKET N {{ticket}}. La reparacion consiste en {{ultima_novedad}}. El precio es de {{presupuesto}}

MODOS DE PAGO:
- Transferencia
- Pagando en efectivo 5% de descuento
- Tarjeta de credito: 10% de interes en una cuota, resto de las cuotas varian segun el banco',
    1,
    1,
    1
);
PRINT 'Inserted Presupuestado template';

-- Insert Reparado template
INSERT INTO [dbo].[WhatsAppTemplate] (Nombre, Descripcion, EstadoReparacionId, TipoTemplate, Mensaje, Activo, Orden, EsDefault)
VALUES (
    N'Reparado',
    N'Mensaje para informar que el equipo esta reparado y listo para retirar',
    @ReparadoId,
    'estado',
    N'Hola {{cliente}}! Tu equipo ya se encuentra reparado! Lo pueden retirar cuando guste, dentro de nuestros horarios que se encuentran anotados al pie del ticket.',
    1,
    2,
    1
);
PRINT 'Inserted Reparado template';

-- Insert Rechazado template
INSERT INTO [dbo].[WhatsAppTemplate] (Nombre, Descripcion, EstadoReparacionId, TipoTemplate, Mensaje, Activo, Orden, EsDefault)
VALUES (
    N'Rechazado',
    N'Mensaje para informar que el equipo no tiene reparacion',
    @RechazadoId,
    'estado',
    N'Buenos dias! Me comunico de Fast Service por el ticket {{ticket}} para avisarle que su aparato no tiene reparacion.
Lo retiran con el ticket.',
    1,
    3,
    1
);
PRINT 'Inserted Rechazado template';

-- Insert Recordatorio template (no specific state)
INSERT INTO [dbo].[WhatsAppTemplate] (Nombre, Descripcion, EstadoReparacionId, TipoTemplate, Mensaje, Activo, Orden, EsDefault)
VALUES (
    N'Recordatorio de Retiro',
    N'Mensaje recordatorio para equipos reparados pendientes de retiro',
    @ReparadoId,
    'recordatorio',
    N'NO TE OLVIDES DE TU EQUIPO! Tenemos varios equipos reparados que han estado esperando ser retirados.
Uno es el tuyo correspondiente al ticket {{ticket}} reparado desde {{fecha_estado}}.
Te esperamos!',
    1,
    10,
    1
);
PRINT 'Inserted Recordatorio de Retiro template';

-- Insert General greeting template
INSERT INTO [dbo].[WhatsAppTemplate] (Nombre, Descripcion, EstadoReparacionId, TipoTemplate, Mensaje, Activo, Orden, EsDefault)
VALUES (
    N'Saludo General',
    N'Mensaje de saludo general para cualquier consulta',
    NULL,
    'custom',
    N'Hola {{cliente}}, nos comunicamos de FastService respecto a su orden #{{ticket}}. En que podemos ayudarle?',
    1,
    99,
    0
);
PRINT 'Inserted Saludo General template';

PRINT 'WhatsApp Template migration completed successfully';
PRINT 'NOTE: Edit templates in the UI (Integracion WhatsApp) to add accents if needed';
GO
