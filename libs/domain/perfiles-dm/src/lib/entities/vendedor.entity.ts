import { Usuario } from './usuario.entity';

export class Vendedor extends Usuario {
  readonly nombre: string;
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

    this.nombre = props.nombre;
    this.territorio = props.territorio;
  }
}