import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginDto } from './dtos/request/login.dto';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const mockAppService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('debería llamar al servicio con email y password y retornar el token', async () => {
      // Arrange
      const dto: LoginDto = {
        email: 'test@example.com',
        password: '123456',
      };

      const expectedResult = { access_token: 'jwt.token.mock' };
      jest.spyOn(service, 'login').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.login(dto);

      // Assert
      expect(service.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(result).toEqual(expectedResult);
    });

    it('debería propagar errores del servicio', async () => {
      // Arrange
      const dto: LoginDto = {
        email: 'fail@example.com',
        password: 'wrong',
      };

      jest
        .spyOn(service, 'login')
        .mockRejectedValue(new Error('Credenciales inválidas'));

      // Act + Assert
      await expect(controller.login(dto)).rejects.toThrow('Credenciales inválidas');
    });
  });
});
