import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import path from 'path';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const appName = process.env.NX_TASK_TARGET_PROJECT || 'api1';
        const envPath = path.resolve(process.cwd(), `apps/${appName}/.env`);
        console.log(`✅ Using environment file: ${envPath}`);
        return envPath;
      })(),
    }),
  ],
  exports: [ConfigModule],
})
export class MediSupplyConfigEnvModule {}
