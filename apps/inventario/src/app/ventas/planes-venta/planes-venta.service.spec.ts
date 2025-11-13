import { Test, TestingModule } from '@nestjs/testing';
import { PlanesVentaService } from './planes-venta.service';

describe('PlanesVentaService', () => {
  let service: PlanesVentaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanesVentaService],
    }).compile();

    service = module.get<PlanesVentaService>(PlanesVentaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
