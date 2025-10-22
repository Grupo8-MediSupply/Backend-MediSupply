import { BaseEntity, Email } from '@medi-supply/core';


interface UsuarioProps {
  id?: string;
  email: string;
  rolId: number;
  paisId: number;
  password: string;
  identificacion: string;
  tipoIdentificacion: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Usuario extends BaseEntity<string> {
  readonly email: Email;
  readonly rolId: number;
  readonly paisId: number;
  readonly password: string;
  readonly identificacion: string;
  readonly tipoIdentificacion: number;

  constructor(props: UsuarioProps) {
    super({
      id: props.id ?? crypto.randomUUID(),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });

    this.email = new Email(props.email);
    this.rolId = props.rolId;
    this.paisId = props.paisId;
    this.password = props.password;
    this.identificacion = props.identificacion;
    this.tipoIdentificacion = props.tipoIdentificacion;
  }
}
