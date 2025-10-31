import { BaseEntity, Ubicacion } from "@medi-supply/core";

export class Vehiculo extends BaseEntity<string> {
    readonly placa: string;
    readonly modelo: string
    readonly pais: number;
    readonly ubicacionGeografica: Ubicacion;

    constructor(props: {
        id?: string;
        placa: string;
        modelo: string;
        pais: number;
        ubicacionGeografica: Ubicacion;
    }) {
        super({
            id: props.id ?? crypto.randomUUID(),
        });
        this.placa = props.placa;
        this.modelo = props.modelo;
        this.pais = props.pais;
        this.ubicacionGeografica = props.ubicacionGeografica;
    }
}   
