# WhatsApp Templates System

Este documento describe el sistema de plantillas de WhatsApp para FastService.

## Descripción General

El sistema permite enviar mensajes predefinidos a clientes a través de WhatsApp, con información de la orden completada automáticamente mediante placeholders.

## Plantillas Predeterminadas

### PRESUPUESTADO

Buenos días! Me comunico de Fast Service para pasarle el presupuesto correspondiente al TICKET N° {{ticket}}. La reparación consiste en {{reparacion}}. El precio es de ${{presupuesto}}
MODOS DE PAGO:
Transferencia 
Pagando en efectivo 5% de descuento.
Tarjeta de credito: 10% de interés en una cuota, resto de las cuotas varían depende el banco

### REPARADO

Tu equipo ya se encuentra reparado! Lo pueden retirar cuando guste, dentro de nuestros horarios que se encuentran anotados al pie del ticket {{ticket}}.

### RECHAZADO

Buenos dias! Me comunico de Fast Service por el ticket {{ticket}} para avisarle que su aparato no tiene reparación.
Lo retiran con el ticket

### REPARADO (Recordatorio)

NO TE OLVIDES DE TU EQUIPO! Tenemos varios equipos reparados que han estado esperando ser retirados. 
Uno es el tuyo correspondiente al ticket {{ticket}} reparado desde {{fecha_estado}}.

### SALUDO GENERAL

Hola {{cliente}}! Te contactamos desde Fast Service respecto a tu orden {{ticket}}.

---

## Sistema de Plantillas

### Placeholders Disponibles

Los siguientes placeholders pueden usarse en las plantillas y serán reemplazados automáticamente:

| Placeholder | Descripción | Ejemplo |
|-------------|-------------|---------|
| `{{ticket}}` | Número de orden | 12345 |
| `{{cliente}}` | Nombre del cliente | Juan |
| `{{cliente_completo}}` | Nombre completo | Juan Pérez |
| `{{presupuesto}}` | Precio presupuestado | 15000.00 |
| `{{monto_final}}` | Precio final | 14500.00 |
| `{{dispositivo}}` | Tipo de dispositivo | Notebook |
| `{{marca}}` | Marca del dispositivo | Samsung |
| `{{modelo}}` | Modelo del dispositivo | Galaxy S21 |
| `{{fecha_ingreso}}` | Fecha de ingreso | 15/01/2025 |
| `{{fecha_estado}}` | Fecha último cambio de estado | 20/01/2025 |
| `{{ultima_novedad}}` | Última novedad registrada | Se reemplazó pantalla |
| `{{reparacion}}` | Descripción de reparación | Cambio de pantalla |

### Tipos de Plantillas

1. **Estado (`estado`)**: Vinculadas a un estado de reparación específico. Se muestran automáticamente al enviar mensaje desde una orden en ese estado.

2. **Recordatorio (`recordatorio`)**: Para enviar recordatorios de retiro de equipos reparados.

3. **Personalizado (`custom`)**: Plantillas de uso general sin vinculación a estado.

### Administración de Plantillas

Acceder a **Integración WhatsApp** desde el menú principal para:

- Ver todas las plantillas existentes
- Crear nuevas plantillas
- Editar plantillas existentes
- Eliminar plantillas
- Configurar plantilla por defecto para cada estado

### Uso desde Ordenes

1. Abrir detalles de una orden
2. Hacer clic en el botón de WhatsApp
3. Seleccionar la plantilla deseada (se pre-selecciona según el estado)
4. El mensaje se genera automáticamente con los datos de la orden
5. Confirmar para abrir WhatsApp Web con el mensaje listo para enviar

---

## API Endpoints

### Templates CRUD

- `GET /api/whatsapp/templates` - Listar todas las plantillas
- `GET /api/whatsapp/templates/{id}` - Obtener plantilla por ID
- `GET /api/whatsapp/templates/state/{estadoId}` - Plantillas por estado
- `GET /api/whatsapp/templates/reminders` - Plantillas de recordatorio
- `POST /api/whatsapp/templates` - Crear plantilla
- `PUT /api/whatsapp/templates/{id}` - Actualizar plantilla
- `DELETE /api/whatsapp/templates/{id}` - Eliminar plantilla

### Message Generation

- `GET /api/whatsapp/generate/{orderNumber}?templateId={id}` - Generar mensaje para orden
- `GET /api/whatsapp/placeholders` - Listar placeholders disponibles

---

## Base de Datos

### Tabla: WhatsAppTemplate

```sql
CREATE TABLE [dbo].[WhatsAppTemplate] (
    [WhatsAppTemplateId] INT IDENTITY(1,1) PRIMARY KEY,
    [Nombre] NVARCHAR(100) NOT NULL,
    [Descripcion] NVARCHAR(500) NULL,
    [EstadoReparacionId] INT NULL,
    [TipoTemplate] VARCHAR(20) NOT NULL DEFAULT 'custom',
    [Mensaje] NVARCHAR(MAX) NOT NULL,
    [Activo] BIT NOT NULL DEFAULT 1,
    [Orden] INT NOT NULL DEFAULT 0,
    [EsDefault] BIT NOT NULL DEFAULT 0,
    FOREIGN KEY ([EstadoReparacionId]) REFERENCES [dbo].[EstadoReparacion]([EstadoReparacionId])
);
```

### Migración

Ejecutar el script: `backend/FastService.McpServer/Data/Migrations/001_CreateWhatsAppTemplateTable.sql`