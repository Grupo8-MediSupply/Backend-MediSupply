import { Nombre } from '@medi-supply/core';
import { Usuario } from './usuario.entity';

export class Proveedor extends Usuario {
  readonly nombreProveedor: Nombre;
  readonly contactoPrincipal: Nombre;
  readonly telefonoContacto: string;

  constructor(props: {
    id?: string;
    email: string;
    rolId: number;
    paisId: number;
    password: string;
    tipoIdentificacion: number;
    nombreProveedor: string;
    numeroIdentificacion: string;
    contactoPrincipal: string;
    telefonoContacto: string;
  }) {
    super({
      id: props.id,
      email: props.email,
      rolId: props.rolId,
      paisId: props.paisId,
      password: props.password,
      tipoIdentificacion: props.tipoIdentificacion,
      identificacion: props.numeroIdentificacion,
    });

    this.nombreProveedor = new Nombre(props.nombreProveedor);
    this.contactoPrincipal = new Nombre(props.contactoPrincipal);
    this.telefonoContacto = props.telefonoContacto;
  }

  toPrimitives() {
    return {
      id: this.id,
      email: this.email.Value,
      rolId: this.rolId,
      paisId: this.paisId,
      nombreProveedor: this.nombreProveedor.Value,
      identificacion: this.identificacion,
      contactoPrincipal: this.contactoPrincipal.Value,
      telefonoContacto: this.telefonoContacto,
      password: this.password,
    };
  }
}
