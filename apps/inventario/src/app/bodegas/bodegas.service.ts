import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IBodegaRepository, Bodega } from '@medi-supply/bodegas-dm';
import { BodegaResponseDto } from './dtos/response/bodega.response.dto';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { ProductoService } from '../productos/producto.service';
import { Lote } from '@medi-supply/bodegas-dm';


@Injectable()
export class BodegasService {

  
  constructor(
    @Inject('IBodegaRepository')
    private readonly repo: IBodegaRepository,
    private readonly productoService: ProductoService,
  ) {}
  
  async obtenerProductosEnBodega(id: string, pais: number) {
        const bodega = await this.repo.findById(id);
    if (!bodega || bodega.paisId !== pais) {
      throw new NotFoundException('La bodega no existe o no pertenece a su país.');
    }

    // Obtener los productos en la bodega utilizando el servicio de productos
    const productosEnBodega = await this.productoService.obtenerProductosEnBodega(id);
    return productosEnBodega;
  }
  
  async findByPaisId(paisId: number): Promise<BodegaResponseDto[]> {
    const bodegas: Bodega[] = await this.repo.findByPaisId(paisId);
    return bodegas.map(
      (b) =>
        new BodegaResponseDto(
          b.id,
          b.paisId,
          b.nombre,
          b.ubicacion,
          b.capacidad,
          b.responsable,
          b.createdAt,
          b.updatedAt
        )
    );
  }

  async findAll(): Promise<BodegaResponseDto[]> {
    const bodegas: Bodega[] = await this.repo.findAll();
    return bodegas.map(
      (b) =>
        new BodegaResponseDto(
          b.id,
          b.paisId,
          b.nombre,
          b.ubicacion,
          b.capacidad,
          b.responsable,
          b.createdAt,
          b.updatedAt
        )
    );
  }

  async findById(id: string , user: JwtPayloadDto): Promise<BodegaResponseDto> {
    const bodega = await this.repo.findById(id);

    if (!bodega || bodega.paisId !== user.pais) {
      throw new NotFoundException('La bodega no existe.');
    }

    return new BodegaResponseDto(
      bodega.id,
      bodega.paisId,
      bodega.nombre,
      bodega.ubicacion,
      bodega.capacidad,
      bodega.responsable,
      bodega.createdAt,
      bodega.updatedAt
    );
  }

  async findLoteEnBodega(loteId: string, bodegaId: string): Promise<Lote | null> {
    return this.repo.findLoteEnBodega(loteId, bodegaId);
  }

}
