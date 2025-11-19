import { IProveedorRepository, Proveedor } from '@medi-supply/perfiles-dm';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';
import { HistorialCompra, HistorialCompraFiltros } from '@medi-supply/perfiles-dm';

export class ProveedorRepository implements IProveedorRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async create(proveedor: Proveedor): Promise<Proveedor> {
    const trx = await this.db.transaction();
    try {
      const [usuario] = await trx('usuarios.usuario')
        .insert({
          email: proveedor.email.Value,
          identificacion: proveedor.identificacion,
          tipo_identificacion_id: proveedor.tipoIdentificacion,
          rol_id: proveedor.rolId,
          pais_id: proveedor.paisId,
          password_hash: proveedor.password,
        })
        .returning(['id']);

      const [created] = await trx('usuarios.proveedor')
        .insert({
          id: usuario.id,
          nombre: proveedor.nombreProveedor.Value,
          contacto_principal: proveedor.contactoPrincipal.Value,
          telefono: proveedor.telefonoContacto,
        })
        .returning(['id', 'nombre', 'contacto_principal', 'telefono']);

      await trx.commit();

      return new Proveedor({
        id: created.id,
        email: proveedor.email.Value,
        paisId: proveedor.paisId,
        nombreProveedor: proveedor.nombreProveedor.Value,
        numeroIdentificacion: proveedor.identificacion,
        contactoPrincipal: proveedor.contactoPrincipal.Value,
        telefonoContacto: proveedor.telefonoContacto,
        rolId: proveedor.rolId,
        password: proveedor.password,
        tipoIdentificacion: proveedor.tipoIdentificacion,
      });
    } catch (error) {
      await trx.rollback();
      console.error('❌ Error al crear proveedor:', error);
      throw new InternalServerErrorException('Error al crear el proveedor.');
    }
  }

  async findById(id: string): Promise<Proveedor | null> {
    try {
      const proveedor = await this.db('usuarios.proveedor')
        .select(
          'proveedor.id',
          'proveedor.nombre',
          'proveedor.contacto_principal',
          'proveedor.telefono_contacto',
          'usuario.email',
          'usuario.rol_id',
          'usuario.pais_id',
          'usuario.password',
          'usuario.identificacion',
          'usuario.tipo_identificacion',
        )
        .innerJoin('usuario', 'usuario.id', 'proveedor.usuario_id')
        .where('proveedor.id', id)
        .first();

      if (!proveedor) return null;

      return new Proveedor({
        id: proveedor.id,
        email: proveedor.email,
        nombreProveedor: proveedor.nombre,
        numeroIdentificacion: proveedor.identificacion,
        contactoPrincipal: proveedor.contacto_principal,
        telefonoContacto: proveedor.telefono_contacto,
        rolId: proveedor.rol_id,
        paisId: proveedor.pais_id,
        password: '***',
        tipoIdentificacion: proveedor.tipo_identificacion,
      });
    } catch (error) {
      console.error('❌ Error al buscar proveedor por ID:', error);
      throw new InternalServerErrorException('Error al buscar proveedor.');
    }
  }

  async findByPais(pais: number): Promise<Proveedor[]> {
    try {
      const proveedores = await this.db('usuarios.proveedor')
        .select(
          'proveedor.id',
          'proveedor.nombre',
          'proveedor.contacto_principal',
          'proveedor.telefono',
          'usuario.email',
          'usuario.rol_id',
          'usuario.pais_id',
          'usuario.password_hash',
          'usuario.identificacion',
          'usuario.tipo_identificacion_id',
        )
        .innerJoin('usuarios.usuario', 'usuario.id', 'proveedor.id')
        .where('usuario.pais_id', pais);

      return proveedores.map(
        (proveedor) =>
          new Proveedor({
            id: proveedor.id,
            email: proveedor.email,
            nombreProveedor: proveedor.nombre,
            numeroIdentificacion: proveedor.identificacion,
            contactoPrincipal: proveedor.contacto_principal,
            telefonoContacto: proveedor.telefono,
            rolId: proveedor.rol_id,
            paisId: proveedor.pais_id,
            password: '***',
            tipoIdentificacion: proveedor.tipo_identificacion_id,
          }),
      );
    } catch (error) {
      console.error('❌ Error al buscar proveedores por país:', error);
      throw new InternalServerErrorException('Error al buscar proveedores.');
    }
  }

  async obtenerHistorialCompras(filtros: HistorialCompraFiltros): Promise<HistorialCompra[]> {
    const rows = await this.db('productos.solicitud_proveedor as sp')
      .leftJoin('productos.producto_regional as pr', 'pr.id', 'sp.producto_regional_id')
      .leftJoin('productos.producto_global as pg', 'pg.id', 'pr.producto_global_id')
      .select(
        'sp.proveedor_id as proveedorId',
        'pg.nombre as producto',
        'sp.cantidad as cantidad',
        this.db.raw('(sp.cantidad * pr.precio) as valorTotal'),
        'sp.created_at as fechaCompra',
        'pr.pais_id as paisId',
      )
      .modify((qb) => {
        if (filtros.proveedorId) {
          qb.andWhere('sp.proveedor_id', filtros.proveedorId);
        }
        if (filtros.paisId) {
          qb.andWhere('pr.pais_id', filtros.paisId);
        }
        if (filtros.fechaInicio) {
          const inicio = new Date(filtros.fechaInicio);
          inicio.setHours(0, 0, 0, 0);
          qb.andWhere('sp.created_at', '>=', inicio);
        }
        if (filtros.fechaFin) {
          const fin = new Date(filtros.fechaFin);
          fin.setHours(23, 59, 59, 999);
          qb.andWhere('sp.created_at', '<=', fin);
        }
      })
      .orderBy('sp.created_at', 'desc');

    return rows.map((row) => ({
      proveedorId: row.proveedorId,
      producto: row.producto,
      cantidad: Number(row.cantidad),
      valorTotal: Number(row.valorTotal),
      fechaCompra: new Date(row.fechaCompra),
      paisId: row.paisId ? Number(row.paisId) : undefined,
    }));
  }
}