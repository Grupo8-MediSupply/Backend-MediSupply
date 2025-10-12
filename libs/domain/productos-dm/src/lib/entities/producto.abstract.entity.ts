import { BaseEntity } from '@medi-supply/core';

export interface ProductoPros {
    id: number;
    sku: string;
    nombre: string;
    descripcion?: string;
    createdAt?: Date;
    updatedAt?: Date;
}


export abstract class ProductoGlobal extends BaseEntity<number> {
    readonly sku: string;
    readonly nombre: string;
    readonly descripcion?: string;

    constructor(props: ProductoPros){
        super({
            id: props.id,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        });
        this.sku = props.sku;
        this.nombre = props.nombre;
        this.descripcion = props.descripcion;

    }

}


