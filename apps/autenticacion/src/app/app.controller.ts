import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginDto } from './dtos/request/login.dto';
import { Public } from '@medi-supply/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Post('login')
  async login(@Body() login: LoginDto) {
    return await this.appService.login(login.email, login.password);
  }

  @Get('jwks.json')
  async getJwks() {
    return {
      keys: [
        {
          kty: 'RSA',
          n: 'u8giHs0Hqq523SYVN8htd5cI0p8cPRzJh_HIXViXWI5tIPqfXXnSrMxu495FTaZ4U6T3K9foxJx1W3TCgDgca-VkT070RxXSnYF_GfXwzMAH53S6a-O7W2DeJagS1JG95YBr4m4T6w_skdkcoggigHrgcFCv8-sqfJF_--tyHiq6EfIdFl1FXYA3MJO1ZaRHwZGeM1to_XR_wnYMWpPiKg7JHV_j0XS48459dRDdL61CZuNYtL39GKuHvQTpW-1tDJgR-6X9uyIdrBtmKd9ymBK6qhe-LnHMZBSQkmMFZD60Fme1dCsiiGwRkOrOyZi9TbKEwp04a3yma0o5pCqmSQ',
          e: 'AQAB',
          kid: 'mymainkey-1',
          use: 'sig',
          alg: 'RS256',
        },
      ],
    };
  }
}
