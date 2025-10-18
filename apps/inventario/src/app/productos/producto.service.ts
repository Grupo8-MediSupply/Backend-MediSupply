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
import { ProductoInfoRegionResponseDto } from './dtos/response/producto-info-region.response.dto';
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


  async obtenerProductosDeUnaRegion(regionId: number): Promise<ProductoInfoRegionResponseDto[]> {
    const productos = await this.productoRepository.findByPais(regionId);
    if (!productos || productos.length === 0) {
      throw new NotFoundException(`No se encontraron productos para la región con ID ${regionId}`);
    }
    return productos.map(producto => {
      const dto = new ProductoInfoRegionResponseDto();
      dto.productoRegionalId = producto.productoRegionalId;
      dto.sku = producto.sku;
      dto.nombre = producto.nombre;
      dto.descripcion = producto.descripcion;
      dto.tipo = producto.tipo;
      dto.precio = producto.precio;
      return dto;
    });
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
      };
    } else if (producto instanceof ProductoInsumoMedico) {
      response.tipo = 'insumo_medico';
      response.detalleEspecifico = {
        material: producto.material,
        esteril: producto.esteril,
        usoUnico: producto.usoUnico,
      };
    } else if (producto instanceof ProductoEquipoMedico) {
      response.tipo = 'equipo_medico';
      response.detalleEspecifico = {
        marca: producto.marca,
        modelo: producto.modelo,
        vidaUtil: producto.vidaUtil,
        requiereMantenimiento: producto.requiereMantenimiento,
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
          material: data.material,
          esteril: data.esteril,
          usoUnico: data.usoUnico,
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
          vidaUtil: data.vidaUtil,
          requiereMantenimiento: data.requiereMantenimiento,
        });
      }

      default:
        throw new BadRequestException(
          `Tipo de producto no válido: ${dto.tipo}`
        );
    }
  }
}
