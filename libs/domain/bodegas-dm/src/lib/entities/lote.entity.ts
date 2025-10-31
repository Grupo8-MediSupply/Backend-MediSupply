import { BaseEntity } from '@medi-supply/core';

export class Lote extends BaseEntity<string> {

    readonly productoRegionalId: string;
    readonly numero: string;
    readonly fechaVencimiento: Date;
    readonly cantidad: number;
    readonly estado: string;

    constructor(props: {
        id?: string;
        productoRegionalId: string;
        numero: string;
        fechaVencimiento: Date;
        cantidad: number;
        estado: string;
    }) {
        super({
            id: props.id ?? crypto.randomUUID(),
        });
        this.productoRegionalId = props.productoRegionalId;
        this.numero = props.numero;
        this.fechaVencimiento = props.fechaVencimiento;
        this.cantidad = props.cantidad;
        this.estado = props.estado;
    }   
}
