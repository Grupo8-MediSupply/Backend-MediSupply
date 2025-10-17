import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginDto } from './dtos/request/login.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Post('login')
  async login(@Body() login: LoginDto) {
    return await this.appService.login(login.email, login.password);
  }
}
