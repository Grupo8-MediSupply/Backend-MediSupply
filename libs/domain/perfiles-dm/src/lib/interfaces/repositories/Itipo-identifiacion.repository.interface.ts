import { TipoIdentificacion } from '../../entities/tipo-identificacion.entity';

export interface ITipoIdentificacionRepository {
  findByPaisId(paisId: number): Promise<TipoIdentificacion[]>;
}
