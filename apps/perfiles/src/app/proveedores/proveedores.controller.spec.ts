import { Test, TestingModule } from '@nestjs/testing';
import { ProveedoresController } from './proveedores.controller';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dtos/request/create-proveedor.dto';

describe('ProveedoresController', () => {
  let controller: ProveedoresController;
  let service: jest.Mocked<ProveedoresService>;

  beforeEach(async () => {
    const mockProveedoresService: jest.Mocked<Partial<ProveedoresService>> = {
      create: jest.fn(),
      findByPais: jest.fn(),
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
    service = module.get(ProveedoresService) as unknown as jest.Mocked<ProveedoresService>;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('createProveedor', () => {
    it('debería llamar al servicio con el DTO y pais correctos y retornar su resultado', async () => {
      // Arrange
      const dto: CreateProveedorDto = {
        nombreProveedor: 'Laboratorios Sanar',
        numeroIdentificacion: '900123456-7',
        pais: 1,
        email: 'contacto@sanar.com',
        contactoPrincipal: 'María Gómez',
        telefonoContacto: '+57 3102345678',
        tipoIdentificacion: 1,
      };

      const mockToken = { pais: 1 } as any; // simula el @User()

      const expectedResult = { id: 'uuid-123', ...dto };
      service.create.mockResolvedValue(expectedResult as any);

      // Act
      const result = await controller.createProveedor(dto, mockToken);

      // Assert
      expect(service.create).toHaveBeenCalledWith(dto, mockToken.pais);
      expect(result).toEqual(expectedResult);
    });
  });

  test('debería devolver proveedores por país (AAA)', async () => {
    // Arrange
    const pais = 51;
    const expected = [
      { id: 'p1', nombre: 'Proveedor Uno', pais, email: 'p1@ejemplo.com' },
      { id: 'p2', nombre: 'Proveedor Dos', pais, email: 'p2@ejemplo.com' },
    ];
    service.findByPais.mockResolvedValue(expected as any);

    // Act
    const result = await controller.obtenerProveedoresPorPais(pais);

    // Assert
    expect(service.findByPais).toHaveBeenCalledWith(pais);
    expect(result).toEqual(expected);
  });

  test('debería propagar errores del servicio (AAA)', async () => {
    // Arrange
    const pais = 99;
    service.findByPais.mockRejectedValue(new Error('fail'));

    // Act & Assert
    await expect(controller.obtenerProveedoresPorPais(pais)).rejects.toThrow('fail');
    expect(service.findByPais).toHaveBeenCalledWith(pais);
  });
});