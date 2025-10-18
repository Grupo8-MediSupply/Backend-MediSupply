import {
  IProductoRepository,
  ProductoEquipoMedico,
  ProductoInsumoMedico,
  ProductoMedicamento,
  ProductoVariant,
} from '@medi-supply/productos-dm';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';

export class ProductoRepository implements IProductoRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly db: Knex) {}

  async create(producto: ProductoVariant): Promise<ProductoVariant> {
    return this.db.transaction(async (trx) => {
      try {
        // 1️⃣ Insertar en producto_global
        const [global] = await trx('productos.producto_global')
          .insert({
            sku: producto.sku,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
          })
          .returning([
            'id',
            'sku',
            'nombre',
            'descripcion',
            'created_at',
            'updated_at',
          ]);

        // 2️⃣ Insertar en tabla especializada según tipo
        if (producto instanceof ProductoMedicamento) {
          await trx('productos.medicamento').insert({
            producto_global_id: global.id,
            principio_activo: producto.principioActivo,
            concentracion: producto.concentracion,
            forma_farmaceutica: producto.formaFarmaceutica,
          });
        } else if (producto instanceof ProductoInsumoMedico) {
          await trx('productos.insumo_medico').insert({
            producto_global_id: global.id,
            marca: producto.marca,
            modelo: producto.modelo,
            fabricante: producto.fabricante,
            unidad: producto.unidad,
            lote: producto.lote,
            fecha_vencimiento: producto.fechaVencimiento ?? null,
          });
        } else if (producto instanceof ProductoEquipoMedico) {
          await trx('productos.equipo_medico').insert({
            producto_global_id: global.id,
            marca: producto.marca,
            modelo: producto.modelo,
            numero_serie: producto.numeroSerie,
            proveedor: producto.proveedor,
            fecha_compra: producto.fechaCompra ?? null,
            garantia_meses: producto.garantiaMeses ?? null,
          });
        } else {
          throw new Error(`Tipo de producto no reconocido`);
        }

        // 3️⃣ Retornar instancia actualizada
        return Object.assign(Object.create(Object.getPrototypeOf(producto)), {
          ...producto,
          id: global.id,
        });
      } catch (error) {
        throw new InternalServerErrorException('Error al crear el producto.');
      }
    });
  }

   async findById(id: number): Promise<ProductoVariant | null> {
    try {
      // 1️⃣ Consultar producto base
      const base = await this.db('productos.producto_global')
        .select('*')
        .where({ id })
        .first();

      if (!base) return null;

      // 2️⃣ Buscar detalle en tabla medicamento
      const medicamento = await this.db('productos.medicamento')
        .select('*')
        .where({ producto_global_id: id })
        .first();

      if (medicamento) {
        return new ProductoMedicamento({
          id: base.id,
          sku: base.sku,
          nombre: base.nombre,
          descripcion: base.descripcion,
          createdAt: base.created_at,
          updatedAt: base.updated_at,
          principioActivo: medicamento.principio_activo,
          concentracion: medicamento.concentracion,
          formaFarmaceutica: medicamento.forma_farmaceutica,
          viaAdministracion: medicamento.via_administracion,
          laboratorio: medicamento.laboratorio,
          registroSanitario: medicamento.registro_sanitario,
        });
      }

      // 3️⃣ Buscar detalle en tabla insumo_medico
      const insumo = await this.db('productos.insumo_medico')
        .select('*')
        .where({ producto_global_id: id })
        .first();

      if (insumo) {
        return new ProductoInsumoMedico({
          id: base.id,
          sku: base.sku,
          nombre: base.nombre,
          descripcion: base.descripcion,
          createdAt: base.created_at,
          updatedAt: base.updated_at,
          marca: insumo.marca,
          modelo: insumo.modelo,
          fabricante: insumo.fabricante,
          unidad: insumo.unidad,
          lote: insumo.lote,
          fechaVencimiento: insumo.fecha_vencimiento,
        });
      }

      // 4️⃣ Buscar detalle en tabla equipo_medico
      const equipo = await this.db('productos.equipo_medico')
        .select('*')
        .where({ producto_global_id: id })
        .first();

      if (equipo) {
        return new ProductoEquipoMedico({
          id: base.id,
          sku: base.sku,
          nombre: base.nombre,
          descripcion: base.descripcion,
          createdAt: base.created_at,
          updatedAt: base.updated_at,
          marca: equipo.marca,
          modelo: equipo.modelo,
          numeroSerie: equipo.numero_serie,
          proveedor: equipo.proveedor,
          fechaCompra: equipo.fecha_compra,
          garantiaMeses: equipo.garantia_meses,
        });
      }

      // Si no está en ninguna tabla hija
      return null;
    } catch (error) {
      console.error('❌ Error al consultar producto por ID:', error);
      throw new InternalServerErrorException('Error al consultar el producto.');
    }
  }
}