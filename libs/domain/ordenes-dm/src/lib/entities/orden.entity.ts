import { BaseEntity } from '@medi-supply/core';


export class Orden extends BaseEntity<string>  {
    readonly productos: ProductoOrden[];
    readonly cliente: string;
    readonly vendedor?: string;
    readonly estado?: string = 'PENDIENTE';

    constructor(props: {
        id?: string;
        productos: ProductoOrden[];
        cliente: string;
        vendedor?: string;
        estado?: string;
    }) {
        super({
            id: props.id ?? crypto.randomUUID(),
        });
        this.productos = props.productos;
        this.cliente = props.cliente;
        this.vendedor = props.vendedor;
        this.estado = props.estado;
    }

}

export interface ProductoOrden{
    lote: string;
    cantidad: number;
    bodega: string;
}