import { Test, TestingModule } from '@nestjs/testing';
import { ProveedoresController } from './proveedores.controller';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dtos/request/create-proveedor.dto';

describe('ProveedoresController', () => {
  let controller: ProveedoresController;
  let service: ProveedoresService;

  beforeEach(async () => {
    const mockProveedoresService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProveedoresController],
      providers: [
        {
          provide: ProveedoresService,
          useValue: mockProveedoresService,
        },
      ],
    }).compile();

    controller = module.get<ProveedoresController>(ProveedoresController);
    service = module.get<ProveedoresService>(ProveedoresService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('createProveedor', () => {
    it('debería llamar al servicio con el DTO correcto y retornar su resultado', async () => {
      // Arrange
      const dto: CreateProveedorDto = {
        nombreProveedor: 'Laboratorios Sanar',
        numeroIdentificacion: '900123456-7',
        pais: 'Colombia',
        email: 'contacto@sanar.com',
        contactoPrincipal: 'María Gómez',
        telefonoContacto: '+57 3102345678',
      };

      const expectedResult = { id: 'uuid-123', ...dto };
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult as any);

      // Act
      const result = await controller.createProveedor(dto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });
});
