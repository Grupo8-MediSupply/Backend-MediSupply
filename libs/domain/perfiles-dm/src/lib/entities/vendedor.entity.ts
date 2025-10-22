import { Nombre } from '@medi-supply/core';
import { Usuario } from './usuario.entity';

export class Vendedor extends Usuario {
  readonly nombre: Nombre;
  readonly territorio?: string;

  constructor(props: {
    id?: string;
    email: string;
    rolId: number;
    paisId: number;
    password: string;
    nombre: string;
    identificacion: string;
    tipoIdentificacion: number;
  }) {
    super({
      id: props.id,
      email: props.email,
      rolId: props.rolId,
      paisId: props.paisId,
      password: props.password,
      identificacion: props.identificacion,
      tipoIdentificacion: props.tipoIdentificacion,
    });

    this.nombre = new Nombre(props.nombre);
  }

  toPrimitives() {
    return {
      id: this.id,
      email: this.email.Value,
      rolId: this.rolId,
      paisId: this.paisId,
      nombre: this.nombre.Value,
      password: this.password,
      identificacion: this.identificacion,
      tipoIdentificacion: this.tipoIdentificacion,
    };
  }
}
