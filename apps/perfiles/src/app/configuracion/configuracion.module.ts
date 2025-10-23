import { Module } from '@nestjs/common';
import { ConfiguracionController } from './configuracion.controller';
import { ConfiguracionService } from './configuracion.service';
import { TipoIdentificacionRepository } from './repositories/tipo-identificacion.repository';
import { PaisRepository } from '../paises/repositories/pais.repository';

@Module({
  controllers: [ConfiguracionController],
  providers: [
    ConfiguracionService,
    { provide: 'IPaisRepository', useClass: PaisRepository },
    { provide: 'ITipoIdentificacionRepository', useClass: TipoIdentificacionRepository },
  ],
})
export class ConfiguracionModule {}
