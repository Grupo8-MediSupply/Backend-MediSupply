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
import { ProductoDetalleResponseDto } from './dtos/response/detalle-response.dto';

@Injectable()
export class ProductoService {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository
  ) {}

  // 🟩 Crear producto (ya existente)
  async createProducto(
    createProductoDto: CreateProductoDto
  ): Promise<ProductoVariant> {
    const producto = this.mapDtoToProductoVariant(createProductoDto);
    return await this.productoRepository.create(producto);
  }

  // 🟦 Nuevo método: obtener detalle del producto por ID
  async findById(id: number): Promise<ProductoDetalleResponseDto> {
    const producto = await this.productoRepository.findById(id);
    if (!producto) {
      throw new NotFoundException(`No se encontró el producto con ID ${id}`);
    }

    const response = new ProductoDetalleResponseDto();
    response.id = producto.id!;
    response.sku = producto.sku;
    response.nombre = producto.nombre;
    response.descripcion = producto.descripcion;

    if (producto instanceof ProductoMedicamento) {
      response.tipo = 'medicamento';
      response.detalleEspecifico = {
        principioActivo: producto.principioActivo,
        concentracion: producto.concentracion,
        formaFarmaceutica: producto.formaFarmaceutica,
        viaAdministracion: producto.viaAdministracion,
        laboratorio: producto.laboratorio,
        registroSanitario: producto.registroSanitario,
      };
    } else if (producto instanceof ProductoInsumoMedico) {
      response.tipo = 'insumo_medico';
      response.detalleEspecifico = {
        marca: producto.marca,
        modelo: producto.modelo,
        fabricante: producto.fabricante,
        unidad: producto.unidad,
        lote: producto.lote,
        fechaVencimiento: producto.fechaVencimiento,
      };
    } else if (producto instanceof ProductoEquipoMedico) {
      response.tipo = 'equipo_medico';
      response.detalleEspecifico = {
        marca: producto.marca,
        modelo: producto.modelo,
        numeroSerie: producto.numeroSerie,
        proveedor: producto.proveedor,
        fechaCompra: producto.fechaCompra,
        garantiaMeses: producto.garantiaMeses,
      };
    }

    // 🔹 Mock temporal — luego se reemplazará con consultas reales a inventario.bodega_producto y normativas
    response.ubicacion = {
      idBodega: 1,
      nombreBodega: 'Bodega Central',
      cantidadDisponible: 20,
    };

    response.regulaciones = {
      pais: 'Colombia',
      normativaTributaria: 'Decreto 1234/2022 - INVIMA',
      observaciones: 'Cumple con la normativa sanitaria vigente.',
    };

    return response;
  }

  // 🧱 Mapeo auxiliar (ya existente)
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
