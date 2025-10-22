import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IBodegaRepository, Bodega } from '@medi-supply/bodegas-dm';
import { BodegaResponseDto } from './dtos/response/bodega.response.dto';
import type { JwtPayloadDto } from '@medi-supply/shared';


@Injectable()
export class BodegasService {
  constructor(
    @Inject('IBodegaRepository')
    private readonly repo: IBodegaRepository
  ) {}

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
}
