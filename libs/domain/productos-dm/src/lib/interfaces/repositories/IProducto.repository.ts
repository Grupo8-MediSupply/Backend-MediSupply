import { ProductoVariant } from "src/lib/enums/product.types";
import { ProductoInfoRegion } from "../entities/producto.info-region.interface";

export interface IProductoRepository {
    create(producto: ProductoVariant): Promise<ProductoVariant>;
    findById(id: number): Promise<ProductoVariant | null>;
    findByPais(regionId: number): Promise<ProductoInfoRegion[]>;

}