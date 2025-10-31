import { BaseEntity, Ubicacion } from '@medi-supply/core';


export class Orden extends BaseEntity<string>  {
    readonly productos: ProductoOrden[];
    readonly cliente: string;
    readonly vendedor?: string;
    readonly estado?: string = 'PENDIENTE';
    readonly pais?: number;

    constructor(props: {
        id?: string;
        productos: ProductoOrden[];
        cliente: string;
        vendedor?: string;
        estado?: string;
        pais?: number;
    }) {
        super({
            id: props.id ?? crypto.randomUUID(),
        });
        this.productos = props.productos;
        this.cliente = props.cliente;
        this.vendedor = props.vendedor;
        this.estado = props.estado;
        this.pais = props.pais;
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
    ubicacion: Ubicacion;
}