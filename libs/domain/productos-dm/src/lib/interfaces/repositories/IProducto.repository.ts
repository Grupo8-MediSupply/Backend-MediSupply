import { ProductoVariant } from "src/lib/enums/product.types";

export interface IProductoRepository {
    create(producto: ProductoVariant): Promise<ProductoVariant>;
    findById(id: number): Promise<ProductoVariant | null>;

}