import { Module } from '@nestjs/common';
import { MediSupplyConfigEnvModule } from '@medi-supply/config-env';
import { MediSupplyDatabaseModule } from '@medi-supply/database';
import { MediSupplySharedModule } from '@medi-supply/shared';
import { MediSupplyPerfilesDmModule } from '@medi-supply/perfiles-dm';
import { VendedoresModule } from './vendedores/vendedores.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { AppController } from './controller.controller';
import { ClientesModule } from './clientes/clientes.module';
import { VisitasModule } from './visitas/visitas.module';
import { PaisesModule } from './paises/paises.module';

@Module({
  imports: [
    MediSupplyConfigEnvModule,
    MediSupplyDatabaseModule,
    MediSupplySharedModule,
    MediSupplyPerfilesDmModule,
    VendedoresModule,
    ProveedoresModule,
    ClientesModule,
    VisitasModule,
    PaisesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
