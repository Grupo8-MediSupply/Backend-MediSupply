import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';


export function setupSwagger(app: INestApplication, title: string, description: string) {

    const config = app.get(ConfigService);
  const configSwagger = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(`http://localhost:${config.get('PORT') || 3000}`, 'Desarrollo local')
    .addServer(`${config.get('CLOUD_RUN_URL')}`, 'Entorno de desarrollo')
    .addServer(`${config.get('API_GATEWAY')}`, 'Entorno de producción')
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
