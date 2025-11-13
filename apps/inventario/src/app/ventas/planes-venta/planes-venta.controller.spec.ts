import { Test, TestingModule } from '@nestjs/testing';
import { PlanesVentaController } from './planes-venta.controller';

describe('PlanesVentaController', () => {
  let controller: PlanesVentaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanesVentaController],
    }).compile();

    controller = module.get<PlanesVentaController>(PlanesVentaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
