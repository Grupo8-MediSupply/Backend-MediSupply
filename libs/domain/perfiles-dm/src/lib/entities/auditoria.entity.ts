import { BaseEntity } from "@medi-supply/core";

export class Auditoria extends BaseEntity<string>{
    accion: string;
    email: string;
    ip: string;
    userId?: string;
    detalles: any;

    constructor(props: {
        id?: string,
        accion: string,
        email: string,
        ip: string,
        userId?: string,
        detalles: any,
        fecha: Date
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
    }
}
