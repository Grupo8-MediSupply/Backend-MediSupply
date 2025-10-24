import { ProductoVariant } from "src/lib/enums/product.types";
import { ProductoInfoRegion } from "../entities/producto.info-region.interface";
import { ProductoDetalle } from "../entities/producto-detalle.interface";

export interface IProductoRepository {
    create(producto: ProductoInfoRegion): Promise<ProductoInfoRegion>;
    findById(id: string,paisId: number): Promise<ProductoDetalle | null>;
    findByPais(regionId: number): Promise<ProductoInfoRegion[]>;
    findBySku(sku: string): Promise<ProductoInfoRegion | null>;
}