# Data Model: Compact Order Details with Novedades and AI Actions

**Feature**: 004-compact-order-details
**Date**: January 8, 2026
**Phase**: 1 - Design

## Entity Definitions

### OrderDetails (Extended)

The main order details object returned by the API.

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| orderNumber | int | Unique order identifier | Reparacion.ReparacionId |
| status | string | Current status name | EstadoReparacion.nombre |
| statusDate | datetime | When status was last changed | Reparacion.ModificadoEn |
| responsable | UserInfo | Employee assigned to order | Usuario via EmpleadoAsignadoId |
| technician | UserInfo | Technician assigned | Usuario via TecnicoAsignadoId |
| presupuesto | decimal? | Estimated budget | ReparacionDetalle.Presupuesto |
| montoFinal | decimal? | Final price | ReparacionDetalle.Precio |
| isDomicilio | bool | Home service flag | ReparacionDetalle.EsDomicilio |
| isGarantia | bool | Warranty flag | ReparacionDetalle.EsGarantia |
| customer | CustomerInfo | Customer information | Cliente + Direccion |
| device | DeviceInfo | Device information | ReparacionDetalle + Marca + TipoDispositivo |
| novedades | Novedad[] | Order history entries | Novedad + TipoNovedad |
| entryDate | datetime | Order creation date | Reparacion.CreadoEn |

### CustomerInfo (Extended)

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| customerId | int | Customer ID | Cliente.ClienteId |
| dni | string? | Document number | Cliente.Dni |
| firstName | string | First name | Cliente.Nombre |
| lastName | string | Last name | Cliente.Apellido |
| fullName | string | Computed: firstName + lastName | Derived |
| email | string? | Email address | Cliente.Mail |
| phone | string? | Primary phone | Cliente.Telefono1 |
| celular | string? | Mobile phone | Cliente.Telefono2 |
| address | AddressInfo | Structured address | Direccion |

### AddressInfo (New)

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| fullAddress | string | Complete address string | Cliente.Direccion or computed |
| calle | string? | Street name | Direccion.Calle |
| altura | string? | Street number | Direccion.Altura |
| entreCalle1 | string? | Cross street 1 | Direccion.Calle2 |
| entreCalle2 | string? | Cross street 2 | Direccion.Calle3 |
| ciudad | string? | City | Direccion.Ciudad |
| codigoPostal | string? | Postal code | Direccion.CodigoPostal |

### DeviceInfo (Extended)

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| deviceType | string | Type of device | TipoDispositivo.nombre |
| brand | string | Device brand | Marca.nombre |
| serialNumber | string? | Serial number | ReparacionDetalle.Serie |
| model | string? | Device model | ReparacionDetalle.Modelo |
| ubicacion | string? | Location/placement | ReparacionDetalle.Unicacion |
| accesorios | string? | Included accessories | ReparacionDetalle.Accesorios |

### NovedadInfo (New)

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| id | int | Novedad ID | Novedad.novedadId |
| fecha | datetime | Event timestamp | Novedad.modificadoEn |
| tipo | string | Event type name | TipoNovedad.nombre |
| monto | decimal? | Amount if applicable | Novedad.monto |
| observacion | string? | Description/notes | Novedad.observacion |
| usuarioId | int | User who created | Novedad.UserId |

### UserInfo (Existing)

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| userId | int | User ID | Usuario.UserId |
| fullName | string | Full name | Usuario.nombre + apellido |
| email | string? | Email | Usuario.mail |

## Relationships

```
OrderDetails
├── customer: CustomerInfo (1:1)
│   └── address: AddressInfo (1:1)
├── device: DeviceInfo (1:1)
├── responsable: UserInfo (1:1)
├── technician: UserInfo (1:1)
└── novedades: NovedadInfo[] (1:N, sorted by fecha DESC)
```

## Database Tables Used (Read Only)

| Table | Purpose | Join Path |
|-------|---------|-----------|
| Reparacion | Core order data | Primary |
| Cliente | Customer info | Reparacion.ClienteId |
| Direccion | Address details | Cliente.DireccionId |
| ReparacionDetalle | Device + pricing | Reparacion.ReparacionDetalleId |
| Marca | Brand lookup | Reparacion.MarcaId |
| TipoDispositivo | Device type lookup | Reparacion.TipoDispositivoId |
| EstadoReparacion | Status lookup | Reparacion.EstadoReparacionId |
| Usuario | User lookup (2x) | EmpleadoAsignadoId, TecnicoAsignadoId |
| Novedad | Order history | Novedad.reparacionId |
| TipoNovedad | History type lookup | Novedad.tipoNovedadId |

## Order Actions (AI Suggestions)

| Action | Label | Description | Mock Behavior |
|--------|-------|-------------|---------------|
| print_dorso | Imprimir Dorso | Print back label | Show "Imprimiendo dorso..." message |
| print | Imprimir | Print order form | Show "Imprimiendo orden..." message |
| nueva | Nueva | Create new order | Show "Creando nueva orden..." message |
| informar_presupuesto | Inform. Presup. | Notify customer of estimate | Show "Presupuesto informado" message |
| nota_reclamo | Nota/Reclamo | Add note or complaint | Prompt for text, show "Nota agregada" |
| reingreso | Reingreso | Re-enter for additional work | Show "Reingreso registrado" message |
| retira | Retira | Mark as picked up | Show "Orden retirada" message |
| sena | Seña | Record deposit payment | Prompt for amount, show "Seña registrada" |

## Validation Rules

- orderNumber must be positive integer
- status must be non-empty string
- customer.firstName and customer.lastName must be non-empty
- novedades sorted by fecha descending (most recent first)
- monto values displayed with 2 decimal places, formatted as ARS currency
