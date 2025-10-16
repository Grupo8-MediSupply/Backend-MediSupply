import { ProductoGlobal, ProductoPros } from "./producto.abstract.entity";

interface ProductoInsumoMedicoProps extends ProductoPros {
    marca?: string;
    modelo?: string;
    fabricante?: string;
    unidad?: string;
    lote?: string;
    fechaVencimiento?: Date;
}

export class ProductoInsumoMedico extends ProductoGlobal {
    readonly marca?: string;
    readonly modelo?: string;
    readonly fabricante?: string;
    readonly unidad?: string;
    readonly lote?: string;
    readonly fechaVencimiento?: Date;

    constructor(props: ProductoInsumoMedicoProps) {
        super(props);
        this.marca = props.marca;
        this.modelo = props.modelo;
        this.fabricante = props.fabricante;
        this.unidad = props.unidad;
        this.lote = props.lote;
        this.fechaVencimiento = props.fechaVencimiento;
    }
}