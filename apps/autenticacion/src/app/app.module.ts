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
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProd = configService.get<string>('NODE_ENV') === 'production';

        const jwtIssuer =
          configService.get<string>('JWT_ISSUER') || 'medi-supply';
        const jwtAudience =
          configService.get<string>('JWT_AUDIENCE') || 'medi-supply-users';

        if (isProd) {
          const privateKey = configService.get<string>('PRIVATE_KEY');
          if (!privateKey) {
            throw new Error('PRIVATE_KEY no está configurado en producción');
          }

          return {
            privateKey,
            signOptions: {
              algorithm: 'RS256',
              expiresIn: `${configService.get('JWT_EXPIRES_IN') || 3600}s`,
              issuer: jwtIssuer,
              audience: jwtAudience,
              header: {
                kid: 'mymainkey-1', // 🔑 aquí pones el mismo que en tu JWKS
                alg: 'RS256',
              },
            },
          };
        } else {
          const secret = configService.get<string>(
            'JWT_SECRET',
            'default_secret'
          );
          return {
            secret,
            signOptions: {
              algorithm: 'HS256',
              expiresIn: `${configService.get('JWT_EXPIRES_IN') || 3600}s`,
              issuer: jwtIssuer,
              audience: jwtAudience,
            },
          };
        }
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'IUsuariosRepository',
      useClass: UsuariosRepository,
    },
  ],
})
export class AppModule {}
