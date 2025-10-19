import { Test, TestingModule } from '@nestjs/testing';
import { PaisesController } from './paises.controller';

describe('PaisesController', () => {
  let controller: PaisesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaisesController],
    }).compile();

    controller = module.get<PaisesController>(PaisesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
