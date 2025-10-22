import { Test, TestingModule } from '@nestjs/testing';
import { VendedoresController } from './vendedores.controller';
import { VendedoresService } from './vendedores.service';
import { CreateVendedorDto } from './dtos/request/create-vendedor.dto';
import { JwtPayloadDto } from '@medi-supply/shared';
import { VendedorResponseDto } from './dtos/response/vendedor.response.dto';

describe('VendedoresController', () => {
  let controller: VendedoresController;
  let service: VendedoresService;

  const payloadMock : JwtPayloadDto ={
    sub: '1',
    email: 'juan@example.com',
    role: 1,
    pais: 10
  }

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
        identificacion: '987654321',
        tipoIdentificacion: 2,
      };

      const expectedResult : VendedorResponseDto = { email: dto.email, paisCreacion: payloadMock.pais.toString()};
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.createVendedor(dto, payloadMock);

      // Assert
      expect(service.create).toHaveBeenCalledWith(dto, payloadMock);
      expect(result).toEqual(expectedResult);
    });
  });
});
