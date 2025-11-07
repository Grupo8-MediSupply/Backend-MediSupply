import { Vendedor } from "src/lib/entities/vendedor.entity";

export interface IVendedorRepository {
    create(vendedor: Vendedor): Promise<Vendedor>;
    findById(id: string): Promise<Vendedor | null>;
    findByCountry(paisId: number): Promise<Vendedor[]>;
}