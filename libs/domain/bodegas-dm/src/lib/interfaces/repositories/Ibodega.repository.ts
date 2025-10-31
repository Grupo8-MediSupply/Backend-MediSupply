import { Bodega } from "src/lib/entities/bodega.entity.js";
import { Lote } from "src/lib/entities/lote.entity";

export interface IBodegaRepository {
  findAll(): Promise<Bodega[]>;
  findById(id: string): Promise<Bodega | null>;
  findByPaisId(paisId: number): Promise<Bodega[]>;
  findLoteEnBodega(loteId: string,bodegaId:string): Promise<Lote | null>;
}
