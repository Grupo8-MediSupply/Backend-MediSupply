import { Usuario } from "@medi-supply/perfiles-dm";

export class InfoUsuarioDto {
  id!: string;
  email!: string;
  rolId!: number;
  activo!: boolean;
  tipoIdentificacion!: number;
  identificacion!: string;

  constructor(partial: Partial<InfoUsuarioDto>) {
    Object.assign(this, partial);
  }
}


export class UsuarioMapper {
  static toInfoUsuarioDto(entity: Usuario): InfoUsuarioDto {
    return new InfoUsuarioDto({
      id: entity.id,
      email: entity.email?.value ?? entity.email,
      rolId: Number(entity.rolId),
      activo: entity.activo,
      tipoIdentificacion: entity.tipoIdentificacion,
      identificacion: entity.identificacion,
    });
  }

  static toInfoUsuarioList(entities: Usuario[]): InfoUsuarioDto[] {
    return entities.map((e) => this.toInfoUsuarioDto(e));
  }
}
