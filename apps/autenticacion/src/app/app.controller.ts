import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginDto } from './dtos/request/login.dto';
import { Auditable, Public } from '@medi-supply/shared';
import { ApiBody, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Autenticación exitosa. Retorna token de acceso.' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas.' })
  @Public()
  @Post('login')
  @Auditable({ module: 'Auth', action: 'Login' })
  async login(@Body() login: LoginDto) {
    return await this.appService.login(login.email, login.password);
  }

}
