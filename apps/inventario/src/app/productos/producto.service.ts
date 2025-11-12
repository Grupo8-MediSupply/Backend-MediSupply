import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductoDto } from './dtos/request/create-producto.dto';
import { UpdateProductoDto } from './dtos/request/update-producto.dto';
import {
  DetalleRegional,
  ProductoBodega,
  ProductoDetalle,
  ProductoEquipoMedico,
  ProductoInfoRegion,
  ProductoInsumoMedico,
  ProductoMedicamento,
  SolicitudProducto,
  type IProductoRepository,
  type ProductoVariant,
} from '@medi-supply/productos-dm';
import { ProductoInfoRegionResponseDto } from './dtos/response/producto-info-region.response.dto';
import { TipoProducto } from '@medi-supply/productos-dm';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { ProductoOrden } from '@medi-supply/ordenes-dm';
import { SolicitarLoteProducto } from './dtos/request/solicitar-lote-productos';

@Injectable()
export class ProductoService {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository
  ) {}

  async solicitarLoteProductos(
    productos: SolicitarLoteProducto[],
    jwt: JwtPayloadDto
  ): Promise<void> {
    const promesas = productos.map(async (producto) => {
      const detalleRegional = await this.productoRepository.findBySku(
        producto.sku,
        jwt.pais
      );

      if (!detalleRegional) return null;

      return {
        sku: detalleRegional.productoGlobal.sku,
        cantidad: producto.cantidad,
        proveedorId: detalleRegional.detalleRegional.proveedor,
        producto_regional_id: detalleRegional.detalleRegional.id!,
      } as SolicitudProducto;
    });

    const resultados = await Promise.all(promesas);

    const detalles = resultados.filter(
      (r): r is SolicitudProducto => r !== null
    );

    if (detalles.length < 1) {
      throw new BadRequestException(
        'No se encontraron productos válidos para solicitar'
      );
    }

    await this.productoRepository.solicitarLoteProductos(detalles);
  }

  async createProducto(
    createProductoDto: CreateProductoDto,
    user: JwtPayloadDto
  ): Promise<ProductoInfoRegionResponseDto> {
    const productoGlobal = this.mapDtoToProductoVariant(createProductoDto);
    const detalleRegional: DetalleRegional = {
      pais: user.pais,
      precio: createProductoDto.precioVenta,
      proveedor: createProductoDto.proveedorId,
      regulaciones: createProductoDto.regulaciones || [],
    };
    const productoRegional: ProductoInfoRegion = {
      productoGlobal: productoGlobal,
      detalleRegional,
    };
    const creado = await this.productoRepository.create(productoRegional);
    return {
      sku: creado.productoGlobal.sku,
      nombre: creado.productoGlobal.nombre,
      descripcion: creado.productoGlobal.descripcion,
      tipo: creado.productoGlobal.tipoProducto,
      precio: creado.detalleRegional.precio,
    };
  }

  async actualizarProducto(
    productoRegionalId: string,
    updateProductoDto: UpdateProductoDto,
    user: JwtPayloadDto
  ): Promise<ProductoInfoRegionResponseDto> {
    const existente = await this.productoRepository.findById(
      productoRegionalId,
      user.pais
    );

    if (!existente || existente.productoPaisId !== user.pais) {
      throw new NotFoundException(
        `Producto con ID ${productoRegionalId} no encontrado`
      );
    }

    const productoGlobal = this.mapDtoToProductoVariant(updateProductoDto);
    const detalleRegional: DetalleRegional = {
      id: productoRegionalId,
      pais: user.pais,
      precio: updateProductoDto.precioVenta,
      proveedor: updateProductoDto.proveedorId,
      regulaciones: updateProductoDto.regulaciones || [],
    };

    const actualizado = await this.productoRepository.update(
      productoRegionalId,
      {
        productoGlobal,
        detalleRegional,
      }
    );

    return {
      productoRegionalId,
      sku: actualizado.productoGlobal.sku,
      nombre: actualizado.productoGlobal.nombre,
      descripcion: actualizado.productoGlobal.descripcion,
      tipo: actualizado.productoGlobal.tipoProducto,
      precio: actualizado.detalleRegional.precio,
    };
  }

  async obtenerProductosDeUnaRegion(
    regionId: number
  ): Promise<ProductoInfoRegionResponseDto[]> {
    const productos = await this.productoRepository.findByPais(regionId);
    if (!productos || productos.length === 0) {
      throw new NotFoundException(
        `No se encontraron productos para la región con ID ${regionId}`
      );
    }
    return productos.map((producto) => {
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
  async findById(id: string, user: JwtPayloadDto): Promise<ProductoDetalle> {
    const producto: ProductoDetalle | null =
      await this.productoRepository.findById(id, user.pais);
    if (!producto || producto.productoPaisId !== user.pais) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async obtenerProductosEnBodega(bodegaId: string): Promise<ProductoBodega[]> {
    return this.productoRepository.findByBodega(bodegaId);
  }

  async actualizarStockProductos(
    productoOrden: ProductoOrden[]
  ): Promise<void> {
    return this.productoRepository.updateStock(productoOrden);
  }

  async findByLote(loteId: string): Promise<DetalleRegional | null> {
    return this.productoRepository.findByLote(loteId);
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
