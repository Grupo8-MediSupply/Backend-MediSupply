import { Bodega } from "src/lib/entities/bodega.entity.js";

export interface IBodegaRepository {
  findAll(): Promise<Bodega[]>;
  findById(id: string): Promise<Bodega | null>;
}
