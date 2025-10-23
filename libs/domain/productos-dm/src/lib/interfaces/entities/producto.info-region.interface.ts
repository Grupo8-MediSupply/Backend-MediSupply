import { ProductoVariant } from "src/lib/enums/product.types";

export interface ProductoInfoRegion {
    productoGlobal: ProductoVariant;
    detalleRegional: DetalleRegional;
}

export interface DetalleRegional {
    id?: string;
    pais: number;
    proveedor: string;
    precio: number;
    regulaciones: string[];
}