import { Inject, Injectable } from '@nestjs/common';
import type { IPaisRepository, Pais } from '@medi-supply/perfiles-dm';
import { PaisResponseDto } from './dtos/response/pais.response.dto';

@Injectable()
export class PaisesService {
  constructor(
    @Inject('IPaisRepository')
    private readonly repo: IPaisRepository,
  ) {}

  async findAll(): Promise<PaisResponseDto[]> {
    const paises: Pais[] = await this.repo.findAll();

    return paises.map(
      (p) =>
        new PaisResponseDto(
          p.id,
          p.codigoIso,
          p.nombre,
          p.moneda,
          p.simboloMoneda,
          p.zonaHoraria,
          p.idiomaOficial,
          p.reguladorSanitario ?? null,
          p.sigla_moneda ?? null,
        ),
    );
  }

  async findById(id: number): Promise<PaisResponseDto | null> {
    const pais = await this.repo.findById(id);
    if (!pais) return null;

    return new PaisResponseDto(
      pais.id,
      pais.codigoIso,
      pais.nombre,
      pais.moneda,
      pais.simboloMoneda,
      pais.zonaHoraria,
      pais.idiomaOficial,
      pais.reguladorSanitario ?? null,
      pais.sigla_moneda ?? null,
    );
  }
}
