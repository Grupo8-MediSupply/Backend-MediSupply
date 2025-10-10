import { Module } from '@nestjs/common';
import { VendedoresController } from './vendedores.controller';
import { VendedoresService } from './vendedores.service';
import { VendedorRepository } from './repositories/vendedor.repository';

@Module({
  controllers: [VendedoresController],
  providers: [VendedoresService,
    {
      provide: 'IVendedorRepository', // inyección basada en token de la interfaz (usar token en tiempo de ejecución)
      useClass: VendedorRepository, // implementación concreta
    },
  ],
})
export class VendedoresModule {}
