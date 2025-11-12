import { DetalleRegional, ProductoInfoRegion } from "../entities/producto.info-region.interface";
import { ProductoBodega, ProductoDetalle } from "../entities/producto-detalle.interface";
import { ProductoOrden } from "@medi-supply/ordenes-dm";
import { SolicitudProducto } from "@medi-supply/productos-dm";

export interface IProductoRepository {
    create(producto: ProductoInfoRegion): Promise<ProductoInfoRegion>;
    findById(id: string,paisId: number): Promise<ProductoDetalle | null>;
    findByPais(regionId: number): Promise<ProductoInfoRegion[]>;
    findBySku(sku: string,paisId?: number): Promise<ProductoInfoRegion | null>;
    findByBodega(bodegaId: string): Promise<ProductoBodega[]>;
    update(productoRegionalId: string, producto: ProductoInfoRegion): Promise<ProductoInfoRegion>;
    updateStock(productoOrden: ProductoOrden[]): Promise<void>;
    findByLote(loteId: string): Promise<DetalleRegional | null>;
    solicitarLoteProductos(solicitudLote: SolicitudProducto[]): Promise<void>;
}