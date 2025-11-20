import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { UsuarioRepository } from './repositories/usuario.repository';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService,
    {
      provide: 'IUsuariosRepository',
      useClass: UsuarioRepository,
    }
  ],
})
export class UsuariosModule {}
