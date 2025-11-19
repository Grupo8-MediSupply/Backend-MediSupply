import { BaseEntity } from "@medi-supply/core";

export type NivelSeveridad = 'BAJA' | 'MEDIA' | 'ALTA';

export class Auditoria extends BaseEntity<string>{
    accion: string;
    email: string;
    ip: string;
    userId?: string;
    detalles: any;
    modulo?: string;
    severidad?: NivelSeveridad;

    constructor(props: {
        id?: string,
        accion: string,
        email: string,
        ip: string,
        userId?: string,
        detalles: any,
        fecha: Date;
        modulo?: string;
        severidad?: NivelSeveridad;
    }) {
        super({
            id: props.id ?? crypto.randomUUID(),
            createdAt: props.fecha
        });
        this.accion = props.accion;
        this.email = props.email;
        this.ip = props.ip;
        this.userId = props.userId;
        this.detalles = props.detalles;
        this.modulo = props.modulo;
        this.severidad = props.severidad ?? 'BAJA';
    }
}
