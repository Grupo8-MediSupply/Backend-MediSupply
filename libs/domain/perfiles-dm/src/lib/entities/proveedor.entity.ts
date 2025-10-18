import { Nombre } from '@medi-supply/core';
import { Usuario } from './usuario.entity';

export class Proveedor extends Usuario {
  readonly nombreProveedor: Nombre;
  readonly numeroIdentificacion: string;
  readonly contactoPrincipal: Nombre;
  readonly telefonoContacto: string;
  readonly pais: string;

  constructor(props: {
    id?: string;
    email: string;
    rolId: number;
    paisId: number;
    password: string;
    nombreProveedor: string;
    numeroIdentificacion: string;
    contactoPrincipal: string;
    telefonoContacto: string;
    pais: string;
  }) {
    super({
      id: props.id,
      email: props.email,
      rolId: props.rolId,
      paisId: props.paisId,
      password: props.password,
    });

    this.nombreProveedor = new Nombre(props.nombreProveedor);
    this.numeroIdentificacion = props.numeroIdentificacion;
    this.contactoPrincipal = new Nombre(props.contactoPrincipal);
    this.telefonoContacto = props.telefonoContacto;
    this.pais = props.pais;
  }

  toPrimitives() {
    return {
      id: this.id,
      email: this.email.Value,
      rolId: this.rolId,
      paisId: this.paisId,
      nombreProveedor: this.nombreProveedor.Value,
      numeroIdentificacion: this.numeroIdentificacion,
      contactoPrincipal: this.contactoPrincipal.Value,
      telefonoContacto: this.telefonoContacto,
      pais: this.pais,
      password: this.password,
    };
  }
}
