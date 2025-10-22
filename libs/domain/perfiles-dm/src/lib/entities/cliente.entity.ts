import { Nombre } from '@medi-supply/core';
import { Usuario } from './usuario.entity';

export class Cliente extends Usuario {
  readonly nombre: Nombre;
  readonly tipoInstitucion?: string;
  readonly clasificacion?: string;
  readonly responsableContacto?: string;

  constructor(props: {
    id?: string;
    email: string;
    rolId: number;
    paisId: number;
    password: string;
    nombre: string;
    tipoInstitucion?: string;
    clasificacion?: string;
    responsableContacto?: string;
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
    this.tipoInstitucion = props.tipoInstitucion;
    this.clasificacion = props.clasificacion;
    this.responsableContacto = props.responsableContacto;
  }

  toPrimitives() {
    return {
      id: this.id,
      email: this.email.Value,
      rolId: this.rolId,
      paisId: this.paisId,
      nombre: this.nombre.Value,
      tipoInstitucion: this.tipoInstitucion,
      clasificacion: this.clasificacion,
      responsableContacto: this.responsableContacto,
      password: this.password,
      identificacion: this.identificacion,
      tipoIdentificacion: this.tipoIdentificacion,
    };
  }
}
