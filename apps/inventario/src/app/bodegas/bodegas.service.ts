import { Inject, Injectable } from '@nestjs/common';
import type { IBodegaRepository, Bodega } from '@medi-supply/bodegas-dm';
import { BodegaResponseDto } from './dtos/response/bodega.response.dto';

@Injectable()
export class BodegasService {
  constructor(
    @Inject('IBodegaRepository')
    private readonly repo: IBodegaRepository,
  ) {}

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
          b.updatedAt,
        ),
    );
  }

  async findById(id: string): Promise<BodegaResponseDto | null> {
    const bodega = await this.repo.findById(id);
    if (!bodega) return null;

    return new BodegaResponseDto(
      bodega.id,
      bodega.paisId,
      bodega.nombre,
      bodega.ubicacion,
      bodega.capacidad,
      bodega.responsable,
      bodega.createdAt,
      bodega.updatedAt,
    );
  }
}
