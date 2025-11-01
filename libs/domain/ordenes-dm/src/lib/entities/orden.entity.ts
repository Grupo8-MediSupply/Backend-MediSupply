import { BaseEntity, Ubicacion } from '@medi-supply/core';


export class Orden extends BaseEntity<string>  {
    readonly productos: ProductoOrden[];
    readonly cliente: string;
    readonly vendedor?: string;
    estado?: string = 'PENDIENTE';
    readonly pais?: number;
    vehiculoAsignado?: string;

    constructor(props: {
        id?: string;
        productos: ProductoOrden[];
        cliente: string;
        vendedor?: string;
        estado?: string;
        pais?: number;
        vehiculoAsignado?: string;
    }) {
        super({
            id: props.id ?? crypto.randomUUID(),
        });
        this.productos = props.productos;
        this.cliente = props.cliente;
        this.vendedor = props.vendedor;
        this.estado = props.estado;
        this.pais = props.pais;
        this.vehiculoAsignado = props.vehiculoAsignado;
    }

}

export interface ProductoOrden{
    lote: string;
    cantidad: number;
    bodega: string;
    precioUnitario?: number;
    productoRegional?: string;
}

export interface OrdenEntrega {
    id: string;
    cliente: ClienteEntrega;
    estado?: string;
    bodegasOrigen: BodegaOrigen[];
}

export interface BodegaOrigen{
    id: string;
    ubicacion: Ubicacion;
}

export interface ClienteEntrega{
    id: string;
    nombre: string;
    ubicacion: Ubicacion;
}