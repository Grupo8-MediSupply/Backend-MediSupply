import { ProductoGlobal, ProductoPros } from "./producto.abstract.entity";

interface ProductoMedicamentoProps extends ProductoPros {
    principioActivo?: string;
    concentracion?: string;
    formaFarmaceutica?: string;
    viaAdministracion?: string;
    laboratorio?: string;
    registroSanitario?: string;
}

export class ProductoMedicamento extends ProductoGlobal {
    readonly principioActivo?: string;
    readonly concentracion?: string;
    readonly formaFarmaceutica?: string;
    readonly viaAdministracion?: string;
    readonly laboratorio?: string;
    readonly registroSanitario?: string;

    constructor(props: ProductoMedicamentoProps) {
        super(props);
        this.principioActivo = props.principioActivo;
        this.concentracion = props.concentracion;
        this.formaFarmaceutica = props.formaFarmaceutica;
        this.viaAdministracion = props.viaAdministracion;
        this.laboratorio = props.laboratorio;
        this.registroSanitario = props.registroSanitario;
    }
}