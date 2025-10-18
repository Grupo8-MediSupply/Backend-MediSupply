export interface ProductoInfoRegion {
    productoGlobalId: number;
    productoRegionalId: string;
    sku: string;
    nombre: string;
    descripcion?: string;
    tipo: string;
    precio: number;
}