import { IsNotEmpty, IsNumber } from "class-validator";

export class SolicitarLoteProducto {
    @IsNotEmpty()
    sku: string;
    @IsNumber()
    cantidad: number;

    constructor(sku: string, cantidad: number) {
        this.sku = sku;
        this.cantidad = cantidad;
    }
}