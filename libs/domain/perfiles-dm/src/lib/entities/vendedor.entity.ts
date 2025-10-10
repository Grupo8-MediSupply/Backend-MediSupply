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
    territorio?: string;
  }) {
    super({
      id: props.id,
      email: props.email,
      rolId: props.rolId,
      paisId: props.paisId,
      password: props.password,
    });

    this.nombre = new Nombre(props.nombre);
    this.territorio = props.territorio;
  }

  toPrimitives() {
    return {
      id: this.id,
      email: this.email.Value,
      rolId: this.rolId,
      paisId: this.paisId,
      nombre: this.nombre.Value,
      territorio: this.territorio,
      password: this.password,
    };
  }
}
