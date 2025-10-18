import { ProductoGlobal, ProductoPros } from "./producto.abstract.entity";

interface ProductoInsumoMedicoProps extends ProductoPros {
    material?: string;
    esteril?: boolean;
    usoUnico?: boolean;
}

export class ProductoInsumoMedico extends ProductoGlobal {
    readonly material?: string;
    readonly esteril?: boolean;
    readonly usoUnico?: boolean;

    constructor(props: ProductoInsumoMedicoProps) {
        super(props);
        this.material = props.material;
        this.esteril = props.esteril;
        this.usoUnico = props.usoUnico;
    }
}