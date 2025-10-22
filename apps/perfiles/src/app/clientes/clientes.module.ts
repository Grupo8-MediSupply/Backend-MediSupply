import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { ClienteRepository } from './repositories/cliente.repository';

@Module({
  controllers: [ClientesController],
  providers: [
    ClientesService,
    {
      provide: 'IClienteRepository',
      useClass: ClienteRepository,
    },
  ],
  exports: [ClientesService],
})
export class ClientesModule {}
