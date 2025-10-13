import { ProductoGlobal, ProductoPros } from "./producto.abstract.entity";

interface ProductoEquipoMedicoProps extends ProductoPros {
    marca?: string;
    modelo?: string;
    numeroSerie?: string;
    proveedor?: string;
    fechaCompra?: Date;
    garantiaMeses?: number;
}

export class ProductoEquipoMedico extends ProductoGlobal {
    readonly marca?: string;
    readonly modelo?: string;
    readonly numeroSerie?: string;
    readonly proveedor?: string;
    readonly fechaCompra?: Date;
    readonly garantiaMeses?: number;

    constructor(props: ProductoEquipoMedicoProps) {
        super(props);
        this.marca = props.marca;
        this.modelo = props.modelo;
        this.numeroSerie = props.numeroSerie;
        this.proveedor = props.proveedor;
        this.fechaCompra = props.fechaCompra;
        this.garantiaMeses = props.garantiaMeses;
    }
}