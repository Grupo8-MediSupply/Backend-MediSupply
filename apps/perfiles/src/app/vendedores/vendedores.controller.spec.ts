import { Test, TestingModule } from '@nestjs/testing';
import { VendedoresController } from './vendedores.controller';
import { VendedoresService } from './vendedores.service';
import { CreateVendedorDto } from './dtos/request/create-vendedor.dto';

describe('VendedoresController', () => {
  let controller: VendedoresController;
  let service: VendedoresService;

  beforeEach(async () => {
    const mockVendedoresService = {
      create: jest.fn(), // mockeamos solo lo necesario
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendedoresController],
      providers: [
        {
          provide: VendedoresService,
          useValue: mockVendedoresService,
        },
      ],
    }).compile();

    controller = module.get<VendedoresController>(VendedoresController);
    service = module.get<VendedoresService>(VendedoresService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('createVendedor', () => {
    it('debería llamar al servicio con el DTO correcto y retornar su resultado', async () => {
      // Arrange
      const dto: CreateVendedorDto = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        territorio: 'COL',
      };

      const expectedResult = { id: 1, ...dto };
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.createVendedor(dto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });
});
