import { Inject, Injectable } from '@nestjs/common';
import type { IUsuariosRepository, Usuario } from '@medi-supply/perfiles-dm';
import { UsuarioMapper } from './dto/info-usuario.dto';
import { UpdateUsuarioDto } from './dto/actualizar-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @Inject('IUsuariosRepository')
    private readonly repo: IUsuariosRepository
  ) {}

  async obtenerUsuariosPorPais(pais: number) {
    const usuarios = await this.repo.findAllByPais(pais);

    return UsuarioMapper.toInfoUsuarioList(usuarios);
  }

  async actualizarUsuario(id: string, usuario: UpdateUsuarioDto): Promise<void> {
    const cambios: Partial<Usuario> = {};

    if (usuario.activo !== undefined) cambios.activo = usuario.activo;

    await this.repo.updateUsuario(id, cambios);
  }
}
