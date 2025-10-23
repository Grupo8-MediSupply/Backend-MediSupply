import { Controller, Get } from '@nestjs/common';
import { Public } from '@medi-supply/shared';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
