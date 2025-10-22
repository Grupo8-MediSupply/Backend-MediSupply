import { Test, TestingModule } from '@nestjs/testing';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dtos/request/create-cliente.dto';

describe('ClientesController', () => {
  let controller: ClientesController;
  let service: ClientesService;

  beforeEach(async () => {
    const mockClientesService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientesController],
      providers: [
        {
          provide: ClientesService,
          useValue: mockClientesService,
        },
      ],
    }).compile();

    controller = module.get<ClientesController>(ClientesController);
    service = module.get<ClientesService>(ClientesService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('createCliente', () => {
    it('debería llamar al servicio con el DTO correcto y retornar su resultado', async () => {
      // Arrange
      const dto: CreateClienteDto = {
        nombre: 'Clínica Santa María',
        tipoInstitucion: 'Hospital Universitario',
        clasificacion: 'Alta complejidad',
        responsableContacto: 'Dra. Laura Gómez',
        email: 'contacto@clinicasantamaria.com',
        pais: 2,
        identificacion: '123456789',
        password: 'securepassword',
        tipoIdentificacion: 1,
      };

      const expectedResult = { id: 'uuid-123', ...dto };
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult as any);

      // Act
      const result = await controller.createCliente(dto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });
});
