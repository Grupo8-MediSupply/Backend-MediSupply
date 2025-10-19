import { Pais } from '../../entities/pais.entity';

export interface IPaisRepository {
  findAll(): Promise<Pais[]>;
  findById(id: number): Promise<Pais | null>;
}
