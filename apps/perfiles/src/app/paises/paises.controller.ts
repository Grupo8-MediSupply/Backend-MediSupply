import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PaisesService } from './paises.service';

@Controller('paises')
export class PaisesController {
  constructor(private readonly service: PaisesService) {}

  @Get()
  async listarPaises() {
    return this.service.findAll();
  }

  @Get(':id')
  async obtenerPais(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }
}
