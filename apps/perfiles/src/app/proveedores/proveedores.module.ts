import { Module } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { ProveedorRepository } from './repositories/proveedor.repository';

@Module({
  controllers: [ProveedoresController],
  providers: [
    ProveedoresService,
    {
      provide: 'IProveedorRepository', 
      useClass: ProveedorRepository,   
    },
  ],
})
export class ProveedoresModule {}
