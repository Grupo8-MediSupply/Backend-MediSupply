import { ProductoEquipoMedico } from "../entities/equipo-medico.entity";
import { ProductoInsumoMedico } from "../entities/insumo-medico.entity";
import { ProductoMedicamento } from "../entities/medicamento.entity";

export type ProductoVariant = ProductoEquipoMedico | ProductoInsumoMedico | ProductoMedicamento;
export enum TipoProducto {
    MEDICAMENTO = 'medicamento',
    INSUMO = 'insumo',
    EQUIPO = 'equipo',
}
