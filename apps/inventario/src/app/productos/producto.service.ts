import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateProductoDto,
} from './dtos/request/create-producto.dto';
import {
  DetalleRegional,
  ProductoEquipoMedico,
  ProductoInfoRegion,
  ProductoInsumoMedico,
  ProductoMedicamento,
  type IProductoRepository,
  type ProductoVariant,
} from '@medi-supply/productos-dm';
import { ProductoInfoRegionResponseDto } from './dtos/response/producto-info-region.response.dto';
import { ProductoDetalleResponseDto } from './dtos/response/detalle-response.dto';
import { TipoProducto } from '@medi-supply/productos-dm';
import type { JwtPayloadDto } from '@medi-supply/shared';



@Injectable()
export class ProductoService {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository
  ) {}

  // 🟩 Crear producto (ya existente)
  async createProducto(
    createProductoDto: CreateProductoDto,
    user: JwtPayloadDto,
  ): Promise<ProductoInfoRegionResponseDto> {
    const productoGlobal = this.mapDtoToProductoVariant(createProductoDto);
    const detalleRegional: DetalleRegional = {
      pais: user.pais,
      precio: createProductoDto.precioVenta,
      proveedor: createProductoDto.proveedorId,
      regulaciones: createProductoDto.regulaciones || [],
    }
    const productoRegional: ProductoInfoRegion = {
      productoGlobal: productoGlobal,
      detalleRegional,
    };
    const creado =  await this.productoRepository.create(productoRegional);
    return {
      sku: creado.productoGlobal.sku,
      nombre: creado.productoGlobal.nombre,
      descripcion: creado.productoGlobal.descripcion,
      tipo: creado.productoGlobal.tipoProducto,
      precio: creado.detalleRegional.precio,
    };
  }


  async obtenerProductosDeUnaRegion(regionId: number): Promise<ProductoInfoRegionResponseDto[]> {
    const productos = await this.productoRepository.findByPais(regionId);
    if (!productos || productos.length === 0) {
      throw new NotFoundException(`No se encontraron productos para la región con ID ${regionId}`);
    }
    return productos.map(producto => {
      const dto = new ProductoInfoRegionResponseDto();
      dto.productoRegionalId = producto.detalleRegional.id;
      dto.sku = producto.productoGlobal.sku;
      dto.nombre = producto.productoGlobal.nombre;
      dto.descripcion = producto.productoGlobal.descripcion;
      dto.tipo = producto.productoGlobal.tipoProducto;
      dto.precio = producto.detalleRegional.precio;
      return dto;
    });
  }



  // 🟦 Nuevo método: obtener detalle del producto por ID
  async findById(id: string): Promise<ProductoDetalleResponseDto> {
    const producto = await this.productoRepository.findById(id);
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    
  }

  // 🧱 Mapeo auxiliar (ya existente)
  private mapDtoToProductoVariant(dto: CreateProductoDto): ProductoVariant {
    const baseProps = {
      sku: dto.sku,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      precioVenta: dto.precioVenta,
      tipoProducto: dto.tipo,
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

      case TipoProducto.INSUMO: {
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

      case TipoProducto.EQUIPO: {
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
