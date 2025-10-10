import { BaseEntity } from '@medi-supply/core';


interface UsuarioProps {
  id?: string;
  email: string;
  rolId: number;
  paisId: number;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Usuario extends BaseEntity<string> {
  readonly email: string;
  readonly rolId: number;
  readonly paisId: number;
  readonly password: string;

  constructor(props: UsuarioProps) {
    super({
      id: props.id ?? crypto.randomUUID(),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });

    this.email = props.email;
    this.rolId = props.rolId;
    this.paisId = props.paisId;
    this.password = props.password;
  }
}
