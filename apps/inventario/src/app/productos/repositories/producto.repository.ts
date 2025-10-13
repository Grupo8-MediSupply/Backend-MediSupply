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

  findById(id: number): Promise<ProductoVariant | null> {
    throw new Error('Method not implemented.');
  }
}
