import { ProductoGlobal, ProductoPros } from "./producto.abstract.entity";

interface ProductoEquipoMedicoProps extends ProductoPros {
    marca?: string;
    modelo?: string;
    vidaUtil?: number;
    requiereMantenimiento?: boolean;
}


export class ProductoEquipoMedico extends ProductoGlobal {
    readonly marca?: string;
    readonly modelo?: string;
    readonly vidaUtil?: number;
    readonly requiereMantenimiento?: boolean;

    constructor(props: ProductoEquipoMedicoProps) {
        super(props);
        this.marca = props.marca;
        this.modelo = props.modelo;
        this.vidaUtil = props.vidaUtil;
        this.requiereMantenimiento = props.requiereMantenimiento;
    }
}