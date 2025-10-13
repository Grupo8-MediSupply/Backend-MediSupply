import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateProductoDto,
  TipoProducto,
} from './dtos/request/create-producto.dto';
import {
  ProductoEquipoMedico,
  ProductoInsumoMedico,
  ProductoMedicamento,
  type IProductoRepository,
  type ProductoVariant,
} from '@medi-supply/productos-dm';

@Injectable()
export class ProductoService {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository
  ) {}

  async createProducto(
    createProductoDto: CreateProductoDto
  ): Promise<ProductoVariant> {
    const producto = this.mapDtoToProductoVariant(createProductoDto);
    return await this.productoRepository.create(producto);
  }

  private mapDtoToProductoVariant(dto: CreateProductoDto): ProductoVariant {
    const baseProps = {
      sku: dto.sku,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    };

    switch (dto.tipo) {
      case TipoProducto.MEDICAMENTO: {
        const data = dto.medicamento;
        if (!data) {
          throw new BadRequestException(
            'Los datos del medicamento son requeridos'
          );
        }

        return new ProductoMedicamento({
          ...baseProps,
          principioActivo: data.principioActivo,
          concentracion: data.concentracion,
        });
      }

      case TipoProducto.INSUMO_MEDICO: {
        const data = dto.insumoMedico;
        if (!data) {
          throw new BadRequestException(
            'Los datos del insumo médico son requeridos'
          );
        }

        return new ProductoInsumoMedico({
          ...baseProps,
          marca: data.marca,
          modelo: data.modelo,
          fabricante: data.fabricante,
          unidad: data.unidad,
          lote: data.lote,
          fechaVencimiento: data.fechaVencimiento
            ? new Date(data.fechaVencimiento)
            : undefined,
        });
      }

      case TipoProducto.EQUIPO_MEDICO: {
        const data = dto.equipoMedico;
        if (!data) {
          throw new BadRequestException(
            'Los datos del equipo médico son requeridos'
          );
        }

        return new ProductoEquipoMedico({
          ...baseProps,
          marca: data.marca,
          modelo: data.modelo,
          numeroSerie: data.numeroSerie,
          proveedor: data.proveedor,
          fechaCompra: data.fechaCompra
            ? new Date(data.fechaCompra)
            : undefined,
          garantiaMeses: data.garantiaMeses,
        });
      }

      default:
        throw new BadRequestException(
          `Tipo de producto no válido: ${dto.tipo}`
        );
    }
  }
}
