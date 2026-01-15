using System;
using System.Collections.Generic;
using FastService.McpServer.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace FastService.McpServer.Data;

public partial class FastServiceDbContext : DbContext
{
    public FastServiceDbContext()
    {
    }

    public FastServiceDbContext(DbContextOptions<FastServiceDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<Comercio> Comercios { get; set; }

    public virtual DbSet<Compra> Compras { get; set; }

    public virtual DbSet<Direccion> Direccions { get; set; }

    public virtual DbSet<EstadoReparacion> EstadoReparacions { get; set; }

    public virtual DbSet<Factura> Facturas { get; set; }

    public virtual DbSet<GlobalConfig> GlobalConfigs { get; set; }

    public virtual DbSet<ItemMenu> ItemMenus { get; set; }

    public virtual DbSet<Log> Logs { get; set; }

    public virtual DbSet<Log1> Logs1 { get; set; }

    public virtual DbSet<Marca> Marcas { get; set; }

    public virtual DbSet<MetodoPago> MetodoPagos { get; set; }

    public virtual DbSet<Modelo> Modelos { get; set; }

    public virtual DbSet<Novedad> Novedads { get; set; }

    public virtual DbSet<OldEstadoRep> OldEstadoReps { get; set; }

    public virtual DbSet<Oldcaja> Oldcajas { get; set; }

    public virtual DbSet<Oldcliente> Oldclientes { get; set; }

    public virtual DbSet<Oldentrega> Oldentregas { get; set; }

    public virtual DbSet<Oldnovedad> Oldnovedads { get; set; }

    public virtual DbSet<Oldobserv> Oldobservs { get; set; }

    public virtual DbSet<Oldresponsable> Oldresponsables { get; set; }

    public virtual DbSet<Oldtecnico> Oldtecnicos { get; set; }

    public virtual DbSet<Oldtranu> Oldtranus { get; set; }

    public virtual DbSet<Pago> Pagos { get; set; }

    public virtual DbSet<Proveedor> Proveedors { get; set; }

    public virtual DbSet<PuntoDeVentum> PuntoDeVenta { get; set; }

    public virtual DbSet<Reparacion> Reparacions { get; set; }

    public virtual DbSet<ReparacionDetalle> ReparacionDetalles { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<RoleMenu> RoleMenus { get; set; }

    public virtual DbSet<TipoDispositivo> TipoDispositivos { get; set; }

    public virtual DbSet<TipoFactura> TipoFacturas { get; set; }

    public virtual DbSet<TipoNovedad> TipoNovedads { get; set; }

    public virtual DbSet<TipoTransaccion> TipoTransaccions { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    public virtual DbSet<UsuarioRol> UsuarioRols { get; set; }

    public virtual DbSet<Ventum> Venta { get; set; }

    public virtual DbSet<VwComprasApagar> VwComprasApagars { get; set; }

    public virtual DbSet<VwProveedoresAcreedore> VwProveedoresAcreedores { get; set; }

    public virtual DbSet<VwReparacionTiempo> VwReparacionTiempos { get; set; }

    public virtual DbSet<VwVentasAnuale> VwVentasAnuales { get; set; }

    public virtual DbSet<VwVentasDiaria> VwVentasDiarias { get; set; }

    public virtual DbSet<VwVentasMensuale> VwVentasMensuales { get; set; }

    public virtual DbSet<WhatsAppTemplate> WhatsAppTemplates { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Connection string configured in Program.cs via dependency injection
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseCollation("Modern_Spanish_CI_AS");

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.ClienteId).HasName("pk_ClienteId");

            entity.ToTable("Cliente");

            entity.Property(e => e.Apellido)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Direccion)
                .HasMaxLength(300)
                .IsUnicode(false);
            entity.Property(e => e.Localidad)
                .HasMaxLength(300)
                .IsUnicode(false);
            entity.Property(e => e.Mail)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Telefono1)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Telefono2)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.DireccionNavigation).WithMany(p => p.Clientes)
                .HasForeignKey(d => d.DireccionId)
                .HasConstraintName("FK__Cliente__Direcci__0A9D95DB");
        });

        modelBuilder.Entity<Comercio>(entity =>
        {
            entity.HasKey(e => e.ComercioId).HasName("PK__Comercio__F8B0B6BF99A32333");

            entity.ToTable("Comercio");

            entity.Property(e => e.Activo)
                .HasDefaultValue(true)
                .HasColumnName("activo");
            entity.Property(e => e.Code)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Contacto)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Cuit)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("cuit");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Direccion)
                .HasMaxLength(400)
                .IsUnicode(false);
            entity.Property(e => e.Localidad)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Mail)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.ModificadoEn)
                .HasColumnType("datetime")
                .HasColumnName("modificadoEn");
            entity.Property(e => e.ModificadoPor).HasColumnName("modificadoPor");
            entity.Property(e => e.Telefono)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Telefono2)
                .HasMaxLength(200)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Compra>(entity =>
        {
            entity.HasKey(e => e.CompraId).HasName("pk_CompraId");

            entity.ToTable("Compra");

            entity.Property(e => e.Descripcion)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.FechaCreacion).HasColumnType("datetime");
            entity.Property(e => e.Monto).HasColumnType("money");
            entity.Property(e => e.ProveedorId)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.Proveedor).WithMany(p => p.Compras)
                .HasForeignKey(d => d.ProveedorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Compra__Proveedo__0B91BA14");

            entity.HasOne(d => d.PuntoDeVenta).WithMany(p => p.Compras)
                .HasForeignKey(d => d.PuntoDeVentaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Compra__PuntoDeV__0C85DE4D");
        });

        modelBuilder.Entity<Direccion>(entity =>
        {
            entity.HasKey(e => e.DireccionId).HasName("pk_DireccionId");

            entity.ToTable("Direccion");

            entity.Property(e => e.Altura)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Calle)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Calle2)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Calle3)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.ChangedOn).HasColumnType("datetime");
            entity.Property(e => e.Ciudad)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.CodigoPostal)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Comentarios)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Latitud).HasColumnType("decimal(9, 6)");
            entity.Property(e => e.Longitud).HasColumnType("decimal(9, 6)");
            entity.Property(e => e.Pais)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Provincia)
                .HasMaxLength(200)
                .IsUnicode(false);
        });

        modelBuilder.Entity<EstadoReparacion>(entity =>
        {
            entity.HasKey(e => e.EstadoReparacionId).HasName("PK__EstadoRe__1765E9FD96A15562");

            entity.ToTable("EstadoReparacion");

            entity.Property(e => e.Activo)
                .HasDefaultValue(true)
                .HasColumnName("activo");
            entity.Property(e => e.Categoria)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("categoria");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(400)
                .IsUnicode(false)
                .HasColumnName("descripcion");
            entity.Property(e => e.ModificadoEn)
                .HasColumnType("datetime")
                .HasColumnName("modificadoEn");
            entity.Property(e => e.ModificadoPor).HasColumnName("modificadoPor");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<Factura>(entity =>
        {
            entity.HasKey(e => e.FacturaId).HasName("pk_FacturaId");

            entity.ToTable("Factura");

            entity.Property(e => e.ModificadoEn).HasColumnType("datetime");
            entity.Property(e => e.NroFactura)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.TipoFactura).WithMany(p => p.Facturas)
                .HasForeignKey(d => d.TipoFacturaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Factura__TipoFac__0D7A0286");
        });

        modelBuilder.Entity<GlobalConfig>(entity =>
        {
            entity.HasKey(e => e.GlobalConfigId).HasName("PK__GlobalCo__449F4989FB1AA585");

            entity.ToTable("GlobalConfig");

            entity.Property(e => e.Key)
                .HasMaxLength(300)
                .IsUnicode(false);
            entity.Property(e => e.Value)
                .HasMaxLength(300)
                .IsUnicode(false);
        });

        modelBuilder.Entity<ItemMenu>(entity =>
        {
            entity.HasKey(e => e.ItemMenuId).HasName("PK__ItemMenu__F9F4344E332F08B6");

            entity.ToTable("ItemMenu");

            entity.Property(e => e.Accion)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Controlador)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Icon)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Parametros)
                .HasMaxLength(500)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Log>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.Log");

            entity.ToTable("Log");

            entity.Property(e => e.Application).HasMaxLength(50);
            entity.Property(e => e.Level).HasMaxLength(50);
            entity.Property(e => e.Logged).HasColumnType("datetime");
            entity.Property(e => e.Logger).HasMaxLength(250);
            entity.Property(e => e.RemoteAddress).HasMaxLength(100);
            entity.Property(e => e.ServerAddress).HasMaxLength(100);
            entity.Property(e => e.UserName).HasMaxLength(250);
        });

        modelBuilder.Entity<Log1>(entity =>
        {
            entity.ToTable("Logs");

            entity.Property(e => e.ErrorClass).HasMaxLength(500);
            entity.Property(e => e.ErrorSource).HasMaxLength(100);
            entity.Property(e => e.EventDateTime).HasColumnType("datetime");
            entity.Property(e => e.EventLevel).HasMaxLength(100);
            entity.Property(e => e.MachineName).HasMaxLength(100);
            entity.Property(e => e.UserName).HasMaxLength(100);
        });

        modelBuilder.Entity<Marca>(entity =>
        {
            entity.HasKey(e => e.MarcaId).HasName("PK__Marca__D5B1CD8BB1F398A1");

            entity.ToTable("Marca");

            entity.Property(e => e.Activo)
                .HasDefaultValue(true)
                .HasColumnName("activo");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(400)
                .IsUnicode(false)
                .HasColumnName("descripcion");
            entity.Property(e => e.ModificadoEn)
                .HasColumnType("datetime")
                .HasColumnName("modificadoEn");
            entity.Property(e => e.ModificadoPor).HasColumnName("modificadoPor");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<MetodoPago>(entity =>
        {
            entity.HasKey(e => e.MetodoPagoId).HasName("pk_MetodoPagoId");

            entity.ToTable("MetodoPago");

            entity.Property(e => e.Descripcion)
                .HasMaxLength(300)
                .IsUnicode(false);
            entity.Property(e => e.Nombre)
                .HasMaxLength(300)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Modelo>(entity =>
        {
            entity.HasKey(e => e.DispositivoModeloId).HasName("PK__Modelo__A32CB69E9E557F60");

            entity.ToTable("Modelo");

            entity.Property(e => e.DispositivoModeloId).ValueGeneratedNever();
            entity.Property(e => e.Activo)
                .HasMaxLength(1)
                .IsFixedLength()
                .HasColumnName("activo");
            entity.Property(e => e.Code)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Descripcion)
                .HasMaxLength(400)
                .IsUnicode(false);
            entity.Property(e => e.Modelo1)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("Modelo");
            entity.Property(e => e.ModificadoEn)
                .HasColumnType("datetime")
                .HasColumnName("modificadoEn");
            entity.Property(e => e.ModificadoPor).HasColumnName("modificadoPor");
        });

        modelBuilder.Entity<Novedad>(entity =>
        {
            entity.HasKey(e => e.NovedadId).HasName("PK__Novedad__7295E4F287B6D0B4");

            entity.ToTable("Novedad");

            entity.HasIndex(e => e.ReparacionId, "nci_wi_Novedad_20E1FB38F8EB1968B3F89A0270BFB4D2");

            entity.Property(e => e.NovedadId).HasColumnName("novedadId");
            entity.Property(e => e.ModificadoEn)
                .HasColumnType("datetime")
                .HasColumnName("modificadoEn");
            entity.Property(e => e.ModificadoPor).HasColumnName("modificadoPor");
            entity.Property(e => e.Monto)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("monto");
            entity.Property(e => e.Observacion)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("observacion");
            entity.Property(e => e.ReparacionId).HasColumnName("reparacionId");
            entity.Property(e => e.TipoNovedadId).HasColumnName("tipoNovedadId");
        });

        modelBuilder.Entity<OldEstadoRep>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("oldEstadoRep");

            entity.Property(e => e.Activo).HasColumnName("activo");
            entity.Property(e => e.Categoria)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("categoria");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(400)
                .IsUnicode(false)
                .HasColumnName("descripcion");
            entity.Property(e => e.ModificadoEn)
                .HasColumnType("datetime")
                .HasColumnName("modificadoEn");
            entity.Property(e => e.ModificadoPor)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("modificadoPor");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<Oldcaja>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("oldcaja");

            entity.Property(e => e.Cerrada)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("cerrada");
            entity.Property(e => e.Concepto)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("concepto");
            entity.Property(e => e.Cond)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("cond");
            entity.Property(e => e.Entrada)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("entrada");
            entity.Property(e => e.Estado)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("estado");
            entity.Property(e => e.Fecha)
                .HasColumnType("datetime")
                .HasColumnName("fecha");
            entity.Property(e => e.Nrocomp).HasColumnName("nrocomp");
            entity.Property(e => e.Nrocue).HasColumnName("nrocue");
            entity.Property(e => e.Otro)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("otro");
            entity.Property(e => e.Poriva).HasColumnName("poriva");
            entity.Property(e => e.Salida)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("salida");
            entity.Property(e => e.Sucur).HasColumnName("sucur");
            entity.Property(e => e.Tipo).HasColumnName("tipo");
            entity.Property(e => e.Transac).HasColumnName("transac");
        });

        modelBuilder.Entity<Oldcliente>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("oldcliente");

            entity.Property(e => e.Categoria)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("categoria");
            entity.Property(e => e.Direcc)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("direcc");
            entity.Property(e => e.Ecalle1)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("ecalle1");
            entity.Property(e => e.Ecalle2)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("ecalle2");
            entity.Property(e => e.Localidad)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("localidad");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.Nrocli).HasColumnName("nrocli");
            entity.Property(e => e.Nroloc).HasColumnName("nroloc");
            entity.Property(e => e.Observ)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("observ");
            entity.Property(e => e.Telefono)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("telefono");
            entity.Property(e => e.Vinopor)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("vinopor");
        });

        modelBuilder.Entity<Oldentrega>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("oldentrega");

            entity.Property(e => e.Direcc)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("direcc");
            entity.Property(e => e.Ecalle1)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("ecalle1");
            entity.Property(e => e.Ecalle2)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("ecalle2");
            entity.Property(e => e.Fecha)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("fecha");
            entity.Property(e => e.Hecho)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("hecho");
            entity.Property(e => e.Local)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("local");
            entity.Property(e => e.Locali)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("locali");
            entity.Property(e => e.Localidad)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("localidad");
            entity.Property(e => e.Nombre)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.Observ)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("observ");
            entity.Property(e => e.Telefono)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("telefono");
            entity.Property(e => e.Tipo)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("tipo");
            entity.Property(e => e.Tipoent)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("tipoent");
            entity.Property(e => e.Tur)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("tur");
            entity.Property(e => e.Ubicacion)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("ubicacion");
        });

        modelBuilder.Entity<Oldnovedad>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("oldnovedad");

            entity.Property(e => e.Codnov)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("codnov");
            entity.Property(e => e.Creado)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("creado");
            entity.Property(e => e.Fecha)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("fecha");
            entity.Property(e => e.Hora)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("hora");
            entity.Property(e => e.Local)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("local");
            entity.Property(e => e.Minutos)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("minutos");
            entity.Property(e => e.Nrotec).HasColumnName("nrotec");
            entity.Property(e => e.Nrotra).HasColumnName("nrotra");
            entity.Property(e => e.Origino)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("origino");
            entity.Property(e => e.Pesos)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("pesos");
            entity.Property(e => e.Transac)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("transac");
            entity.Property(e => e.Visto)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("visto");
        });

        modelBuilder.Entity<Oldobserv>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("oldobserv");

            entity.Property(e => e.Creado).HasColumnName("creado");
            entity.Property(e => e.Local).HasColumnName("local");
            entity.Property(e => e.Observ)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("observ");
            entity.Property(e => e.Transac).HasColumnName("transac");
        });

        modelBuilder.Entity<Oldresponsable>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("oldresponsable");

            entity.Property(e => e.Activo)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("activo");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.NroRes).HasColumnName("nroRes");
        });

        modelBuilder.Entity<Oldtecnico>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("oldtecnico");

            entity.Property(e => e.Activo)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("activo");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
            entity.Property(e => e.NroTec).HasColumnName("nroTec");
        });

        modelBuilder.Entity<Oldtranu>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("oldtranu");

            entity.Property(e => e.Creado).HasColumnName("creado");
            entity.Property(e => e.Decomercio)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("decomercio");
            entity.Property(e => e.Desde)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("desde");
            entity.Property(e => e.Desdeant)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("desdeant");
            entity.Property(e => e.Empresa).HasColumnName("empresa");
            entity.Property(e => e.Entregar)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("entregar");
            entity.Property(e => e.Estant)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("estant");
            entity.Property(e => e.Faccom).HasColumnName("faccom");
            entity.Property(e => e.Fechacom)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("fechacom");
            entity.Property(e => e.Garantia)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("garantia");
            entity.Property(e => e.Impreso)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("impreso");
            entity.Property(e => e.Limite)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("limite");
            entity.Property(e => e.Llamar)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("llamar");
            entity.Property(e => e.Lleva)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("lleva");
            entity.Property(e => e.Local).HasColumnName("local");
            entity.Property(e => e.Lugar)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("lugar");
            entity.Property(e => e.Modelo)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("modelo");
            entity.Property(e => e.Movil)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("movil");
            entity.Property(e => e.Nrocli).HasColumnName("nrocli");
            entity.Property(e => e.Nrocom).HasColumnName("nrocom");
            entity.Property(e => e.Nroemp).HasColumnName("nroemp");
            entity.Property(e => e.Nroes)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nroes");
            entity.Property(e => e.Nroest)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nroest");
            entity.Property(e => e.Nrofac)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nrofac");
            entity.Property(e => e.Nromar).HasColumnName("nromar");
            entity.Property(e => e.Nrotec).HasColumnName("nrotec");
            entity.Property(e => e.Nrotip).HasColumnName("nrotip");
            entity.Property(e => e.Nrotra).HasColumnName("nrotra");
            entity.Property(e => e.Orden)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("orden");
            entity.Property(e => e.Planemp)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("planemp");
            entity.Property(e => e.Planrec)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("planrec");
            entity.Property(e => e.Plantec)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("plantec");
            entity.Property(e => e.Precio)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("precio");
            entity.Property(e => e.Presuparah)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("presuparah");
            entity.Property(e => e.Presupparaf)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("presupparaf");
            entity.Property(e => e.Prioridad)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("prioridad");
            entity.Property(e => e.Rep)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("rep");
            entity.Property(e => e.Sector)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("sector");
            entity.Property(e => e.Serbus)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("serbus");
            entity.Property(e => e.Serie)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("serie");
            entity.Property(e => e.Timestamp)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("timestamp");
            entity.Property(e => e.Trajo)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("trajo");
            entity.Property(e => e.Turno)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("turno");
            entity.Property(e => e.Ubicacion)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("ubicacion");
            entity.Property(e => e.Viejo)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("viejo");
        });

        modelBuilder.Entity<Pago>(entity =>
        {
            entity.HasKey(e => e.PagoId).HasName("pk_PagoId");

            entity.ToTable("Pago");

            entity.Property(e => e.FechaCreacion).HasColumnType("datetime");
            entity.Property(e => e.FechaDebito).HasColumnType("datetime");
            entity.Property(e => e.FechaEmision).HasColumnType("datetime");
            entity.Property(e => e.Monto).HasColumnType("money");
            entity.Property(e => e.Motivo)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.NroReferencia)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.Compra).WithMany(p => p.Pagos)
                .HasForeignKey(d => d.CompraId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Pago__CompraId__0E6E26BF");

            entity.HasOne(d => d.Factura).WithMany(p => p.Pagos)
                .HasForeignKey(d => d.FacturaId)
                .HasConstraintName("FK__Pago__FacturaId__114A936A");

            entity.HasOne(d => d.MetodoDePago).WithMany(p => p.Pagos)
                .HasForeignKey(d => d.MetodoDePagoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Pago__MetodoDePa__10566F31");

            entity.HasOne(d => d.TipoTransaccion).WithMany(p => p.Pagos)
                .HasForeignKey(d => d.TipoTransaccionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Pago__TipoTransa__0F624AF8");
        });

        modelBuilder.Entity<Proveedor>(entity =>
        {
            entity.HasKey(e => e.ProveedorId).HasName("pk_ProveedorId");

            entity.ToTable("Proveedor");

            entity.Property(e => e.ProveedorId)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Contacto)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Direccion)
                .HasMaxLength(300)
                .IsUnicode(false);
            entity.Property(e => e.Localidad)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Mail)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Telefono1)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Telefono2)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<PuntoDeVentum>(entity =>
        {
            entity.HasKey(e => e.PuntoDeVentaId).HasName("pk_PuntoDeVentaId");

            entity.Property(e => e.Descripcion)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Reparacion>(entity =>
        {
            entity.HasKey(e => e.ReparacionId).HasName("PK__Reparaci__A2BA9F0A49844B8F");

            entity.ToTable("Reparacion");

            entity.HasIndex(e => e.CreadoEn, "nci_wi_Reparacion_D43082AEB9F7BE08BC720AD7E6724D35");

            entity.Property(e => e.ReparacionId).ValueGeneratedNever();
            entity.Property(e => e.CreadoEn).HasColumnType("datetime");
            entity.Property(e => e.FechaEntrega).HasColumnType("datetime");
            entity.Property(e => e.InformadoEn).HasColumnType("datetime");
            entity.Property(e => e.ModificadoEn).HasColumnType("datetime");

            entity.HasOne(d => d.Cliente).WithMany(p => p.Reparacions)
                .HasForeignKey(d => d.ClienteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reparacio__Clien__123EB7A3");

            entity.HasOne(d => d.Comercio).WithMany(p => p.Reparacions)
                .HasForeignKey(d => d.ComercioId)
                .HasConstraintName("FK__Reparacio__Comer__18EBB532");

            entity.HasOne(d => d.EmpleadoAsignado).WithMany(p => p.ReparacionEmpleadoAsignados)
                .HasForeignKey(d => d.EmpleadoAsignadoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reparacio__Emple__1332DBDC");

            entity.HasOne(d => d.EstadoReparacion).WithMany(p => p.Reparacions)
                .HasForeignKey(d => d.EstadoReparacionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reparacio__Estad__151B244E");

            entity.HasOne(d => d.Marca).WithMany(p => p.Reparacions)
                .HasForeignKey(d => d.MarcaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reparacio__Marca__160F4887");

            entity.HasOne(d => d.ReparacionDetalle).WithMany(p => p.Reparacions)
                .HasForeignKey(d => d.ReparacionDetalleId)
                .HasConstraintName("FK__Reparacio__Repar__17F790F9");

            entity.HasOne(d => d.TecnicoAsignado).WithMany(p => p.ReparacionTecnicoAsignados)
                .HasForeignKey(d => d.TecnicoAsignadoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reparacio__Tecni__14270015");

            entity.HasOne(d => d.TipoDispositivo).WithMany(p => p.Reparacions)
                .HasForeignKey(d => d.TipoDispositivoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reparacio__TipoD__17036CC0");
        });

        modelBuilder.Entity<ReparacionDetalle>(entity =>
        {
            entity.HasKey(e => e.ReparacionDetalleId).HasName("PK__Reparaci__7E7FF80B71C3E51F");

            entity.ToTable("ReparacionDetalle");

            entity.Property(e => e.Accesorios)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.FechoCompra).HasColumnType("datetime");
            entity.Property(e => e.Modelo)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.ModificadoEn).HasColumnType("datetime");
            entity.Property(e => e.NroFactura)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.NroReferencia)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Precio).HasColumnType("decimal(18, 0)");
            entity.Property(e => e.Presupuesto).HasColumnType("decimal(18, 0)");
            entity.Property(e => e.PresupuestoFecha).HasColumnType("datetime");
            entity.Property(e => e.ReparacionDesc)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Serbus)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Serie)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Unicacion)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RolId).HasName("PK_Rol");

            entity.ToTable("Role");

            entity.Property(e => e.RolId).ValueGeneratedNever();
            entity.Property(e => e.DefaultAction)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.DefaultController)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Descripcion)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<RoleMenu>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("RoleMenu");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");

            entity.HasOne(d => d.ItemMenu).WithMany()
                .HasForeignKey(d => d.ItemMenuId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RoleMenu_ItemMenu");

            entity.HasOne(d => d.Rol).WithMany()
                .HasForeignKey(d => d.RolId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RoleMenu_Rol");
        });

        modelBuilder.Entity<TipoDispositivo>(entity =>
        {
            entity.HasKey(e => e.TipoDispositivoId).HasName("PK__TipoDisp__00B1D80BD3171DC7");

            entity.ToTable("TipoDispositivo");

            entity.Property(e => e.Activo)
                .HasDefaultValue(true)
                .HasColumnName("activo");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(400)
                .IsUnicode(false)
                .HasColumnName("descripcion");
            entity.Property(e => e.ModificadoEn)
                .HasColumnType("datetime")
                .HasColumnName("modificadoEn");
            entity.Property(e => e.ModificadoPor).HasColumnName("modificadoPor");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<TipoFactura>(entity =>
        {
            entity.HasKey(e => e.TipoFacturaId).HasName("pk_TipoFacturaId");

            entity.ToTable("TipoFactura");

            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.ModificadoEn).HasColumnType("datetime");
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<TipoNovedad>(entity =>
        {
            entity.HasKey(e => e.TipoNovedadId).HasName("PK__TipoNove__B14376FC19474489");

            entity.ToTable("TipoNovedad");

            entity.Property(e => e.TipoNovedadId).ValueGeneratedNever();
            entity.Property(e => e.Activo)
                .HasDefaultValue(true)
                .HasColumnName("activo");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(400)
                .IsUnicode(false)
                .HasColumnName("descripcion");
            entity.Property(e => e.ModificadoEn)
                .HasColumnType("datetime")
                .HasColumnName("modificadoEn");
            entity.Property(e => e.ModificadoPor).HasColumnName("modificadoPor");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<TipoTransaccion>(entity =>
        {
            entity.HasKey(e => e.TipoTransaccionId).HasName("pk_TipoTransaccionId");

            entity.ToTable("TipoTransaccion");

            entity.Property(e => e.TipoTransaccionId).ValueGeneratedNever();
            entity.Property(e => e.Descripcion)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Usuario__1788CC4C813AF6F4");

            entity.ToTable("Usuario");

            entity.Property(e => e.Apellido)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Contraseña)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Direccion)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Email)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Login)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Telefono1)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Telefono2)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<UsuarioRol>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("UsuarioRol");

            entity.HasOne(d => d.Rol).WithMany()
                .HasForeignKey(d => d.RolId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UsuarioRol_Rol");
        });

        modelBuilder.Entity<Ventum>(entity =>
        {
            entity.HasKey(e => e.VentaId).HasName("pk_VentaId");

            entity.Property(e => e.Descripcion)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Fecha).HasColumnType("datetime");
            entity.Property(e => e.Monto).HasColumnType("money");
            entity.Property(e => e.RefNumber)
                .HasMaxLength(200)
                .IsUnicode(false);

            entity.HasOne(d => d.Cliente).WithMany(p => p.Venta)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("FK__Venta__ClienteId__1DB06A4F");

            entity.HasOne(d => d.Factura).WithMany(p => p.Venta)
                .HasForeignKey(d => d.FacturaId)
                .HasConstraintName("FK__Venta__FacturaId__2180FB33");

            entity.HasOne(d => d.PuntoDeVenta).WithMany(p => p.Venta)
                .HasForeignKey(d => d.PuntoDeVentaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Venta__PuntoDeVe__1EA48E88");

            entity.HasOne(d => d.TipoTransaccion).WithMany(p => p.Venta)
                .HasForeignKey(d => d.TipoTransaccionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Venta__TipoTrans__208CD6FA");
        });

        modelBuilder.Entity<VwComprasApagar>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_ComprasAPagar");

            entity.Property(e => e.CompraId).ValueGeneratedOnAdd();
            entity.Property(e => e.Descripcion)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.FechaCreacion).HasColumnType("datetime");
            entity.Property(e => e.Monto).HasColumnType("money");
            entity.Property(e => e.ProveedorId)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Saldo)
                .HasColumnType("money")
                .HasColumnName("saldo");
        });

        modelBuilder.Entity<VwProveedoresAcreedore>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_ProveedoresAcreedores");

            entity.Property(e => e.Contacto)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Direccion)
                .HasMaxLength(300)
                .IsUnicode(false);
            entity.Property(e => e.Localidad)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Mail)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.ProveedorId)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Telefono1)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Telefono2)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<VwReparacionTiempo>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_ReparacionTiempos");

            entity.Property(e => e.ReparacionId).HasColumnName("reparacionId");
        });

        modelBuilder.Entity<VwVentasAnuale>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_VentasAnuales");

            entity.Property(e => e.Facturado).HasColumnName("facturado");
            entity.Property(e => e.Total).HasColumnType("money");
        });

        modelBuilder.Entity<VwVentasDiaria>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_VentasDiarias");

            entity.Property(e => e.Facturado).HasColumnName("facturado");
            entity.Property(e => e.Total).HasColumnType("money");
        });

        modelBuilder.Entity<VwVentasMensuale>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_VentasMensuales");

            entity.Property(e => e.Facturado).HasColumnName("facturado");
            entity.Property(e => e.Total).HasColumnType("money");
        });

        modelBuilder.Entity<WhatsAppTemplate>(entity =>
        {
            entity.HasKey(e => e.WhatsAppTemplateId).HasName("pk_WhatsAppTemplateId");

            entity.ToTable("WhatsAppTemplate");

            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Descripcion)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.TipoTemplate)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("estado");
            entity.Property(e => e.Mensaje)
                .HasMaxLength(2000)
                .IsUnicode(false);
            entity.Property(e => e.Activo)
                .HasDefaultValue(true);
            entity.Property(e => e.Orden)
                .HasDefaultValue(0);
            entity.Property(e => e.EsDefault)
                .HasDefaultValue(false);
            entity.Property(e => e.CreadoEn)
                .HasColumnType("datetime")
                .HasDefaultValueSql("GETUTCDATE()");
            entity.Property(e => e.ModificadoEn)
                .HasColumnType("datetime")
                .HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(d => d.EstadoReparacion)
                .WithMany()
                .HasForeignKey(d => d.EstadoReparacionId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_WhatsAppTemplate_EstadoReparacion");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
