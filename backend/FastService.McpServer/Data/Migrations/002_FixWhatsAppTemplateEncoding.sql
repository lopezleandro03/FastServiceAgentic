-- Fix WhatsApp Template encoding issues
-- Run with: sqlcmd -S server -d database -U user -P pass -i file.sql -f 65001

UPDATE [dbo].[WhatsAppTemplate]
SET [Mensaje] = N'Buenos dias! Me comunico de Fast Service para pasarle el presupuesto correspondiente al TICKET N {{ticket}}. La reparacion consiste en {{ultima_novedad}}. El precio es de {{presupuesto}}

MODOS DE PAGO:
- Transferencia
- Pagando en efectivo 5% de descuento
- Tarjeta de credito: 10% de interes en una cuota, resto de las cuotas varian segun el banco'
WHERE [Nombre] = N'Presupuestado';

UPDATE [dbo].[WhatsAppTemplate]
SET [Mensaje] = N'Hola {{cliente}}! Tu equipo ya se encuentra reparado! Lo pueden retirar cuando guste, dentro de nuestros horarios que se encuentran anotados al pie del ticket.'
WHERE [Nombre] = N'Reparado';

UPDATE [dbo].[WhatsAppTemplate]
SET [Mensaje] = N'Buenos dias! Me comunico de Fast Service por el ticket {{ticket}} para avisarle que su aparato no tiene reparacion.
Lo retiran con el ticket.'
WHERE [Nombre] = N'Rechazado';

UPDATE [dbo].[WhatsAppTemplate]
SET [Mensaje] = N'NO TE OLVIDES DE TU EQUIPO! Tenemos varios equipos reparados que han estado esperando ser retirados.
Uno es el tuyo correspondiente al ticket {{ticket}} reparado desde {{fecha_estado}}.
Te esperamos!'
WHERE [Nombre] = N'Recordatorio de Retiro';

UPDATE [dbo].[WhatsAppTemplate]
SET [Mensaje] = N'Hola {{cliente}}, nos comunicamos de FastService respecto a su orden #{{ticket}}. En que podemos ayudarle?'
WHERE [Nombre] = N'Saludo General';

PRINT 'WhatsApp templates encoding fixed (using ASCII-safe characters)';
GO
