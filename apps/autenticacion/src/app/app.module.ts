import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediSupplyConfigEnvModule } from '@medi-supply/config-env';
import { MediSupplyDatabaseModule } from '@medi-supply/database';
import { MediSupplySharedModule } from '@medi-supply/shared';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MediSupplyPerfilesDmModule } from '@medi-supply/perfiles-dm';
import { UsuariosRepository } from './repositories/usuarios.repository';





@Module({
  imports: [
    MediSupplyConfigEnvModule,
    MediSupplyDatabaseModule,
    MediSupplySharedModule,
    MediSupplyPerfilesDmModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [MediSupplyConfigEnvModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default_secret'),
        signOptions: {
          expiresIn: Number(configService.get<string>('JWT_EXPIRES_IN', '3600')),
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: 'IUsuariosRepository',
      useClass: UsuariosRepository
    }
  ],
})
export class AppModule {}
