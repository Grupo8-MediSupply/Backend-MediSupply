import { Inject, Injectable } from '@nestjs/common';
import { Pais, type IPaisRepository, type ITipoIdentificacionRepository } from '@medi-supply/perfiles-dm';

@Injectable()
export class ConfiguracionService {
  constructor(
    @Inject('IPaisRepository') private readonly paisRepo: IPaisRepository,
    @Inject('ITipoIdentificacionRepository') private readonly tipoRepo: ITipoIdentificacionRepository,
  ) {}

  async getConfiguracionPorPais(paisId: number) {
    const pais = await this.paisRepo.findById(paisId);
    if (!pais) {
      return { message: `No se encontró el país con id ${paisId}` };
    }

    const tiposIdentificacion = await this.tipoRepo.findByPaisId(paisId);

    return {
      pais: pais.toPrimitives(),
      tiposIdentificacion: tiposIdentificacion.map((t) => t.toPrimitives()),
    };
  }
}
