import { ProductoGlobal, ProductoPros } from "./producto.abstract.entity";

interface ProductoMedicamentoProps extends ProductoPros {
    principioActivo?: string;
    concentracion?: string;
    formaFarmaceutica?: string;

}

export class ProductoMedicamento extends ProductoGlobal {
    readonly principioActivo?: string;
    readonly concentracion?: string;
    readonly formaFarmaceutica?: string;


    constructor(props: ProductoMedicamentoProps) {
        super(props);
        this.principioActivo = props.principioActivo;
        this.concentracion = props.concentracion;
        this.formaFarmaceutica = props.formaFarmaceutica;

    }
}