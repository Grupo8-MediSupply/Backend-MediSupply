import { Test, TestingModule } from '@nestjs/testing';
import { VisitasController } from './visitas.controller';

describe('VisitasController', () => {
  let controller: VisitasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitasController],
    }).compile();

    controller = module.get<VisitasController>(VisitasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
