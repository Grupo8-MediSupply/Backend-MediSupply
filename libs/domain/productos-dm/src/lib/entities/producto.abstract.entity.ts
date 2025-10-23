import { BaseEntity } from '@medi-supply/core';
import { TipoProducto } from '../enums/product.types';

export interface ProductoPros {
    id?: number;
    sku: string;
    nombre: string;
    descripcion?: string;
    createdAt?: Date;
    updatedAt?: Date;
    tipoProducto: TipoProducto;
}


export abstract class ProductoGlobal extends BaseEntity<number> {
    readonly sku: string;
    readonly nombre: string;
    readonly descripcion?: string;
    readonly tipoProducto: TipoProducto;

    constructor(props: ProductoPros){
        super({
            id: props.id ?? 0,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        });
        this.sku = props.sku;
        this.nombre = props.nombre;
        this.descripcion = props.descripcion;
        this.tipoProducto = props.tipoProducto;

    }

}


