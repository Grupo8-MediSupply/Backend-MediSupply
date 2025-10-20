import { Controller, Get, Param } from '@nestjs/common';
import { BodegasService } from './bodegas.service';

@Controller('v1/bodegas')
export class BodegasController {
  constructor(private readonly service: BodegasService) {}

  @Get()
  async listarBodegas() {
    return this.service.findAll();
  }

  @Get(':id')
  async obtenerBodega(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
