import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import type { JwtPayloadDto } from '@medi-supply/shared';
import { UpdateUsuarioDto } from './dto/actualizar-usuario.dto';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let mockService: jest.Mocked<UsuariosService>;

  beforeEach(() => {
    mockService = {
      obtenerUsuariosPorPais: jest.fn(),
      actualizarUsuario: jest.fn(),
    } as unknown as jest.Mocked<UsuariosService>;

    controller = new UsuariosController(mockService);
  });

  afterEach(() => jest.resetAllMocks());

  test('getUsuarios - debería delegar al servicio y devolver usuarios (AAA)', async () => {
    // Arrange
    const jwt: JwtPayloadDto = { sub: 'u1', email: 'a@b', role: 1, pais: 5 } as any;
    const expected = [{ id: 'u1', nombre: 'User1' }];
    mockService.obtenerUsuariosPorPais.mockResolvedValue(expected as any);

    // Act
    const result = await controller.getUsuarios(jwt);

    // Assert
    expect(mockService.obtenerUsuariosPorPais).toHaveBeenCalledWith(jwt.pais);
    expect(result).toEqual(expected);
  });

  test('actualizarUsuario - debería llamar al servicio con id y dto (AAA)', async () => {
    // Arrange
    const id = 'user-123';
    const dto: UpdateUsuarioDto = { nombre: 'Nuevo', correo: 'n@e.com' } as any;
    const expected = { id, ...dto } as any;
    mockService.actualizarUsuario.mockResolvedValue(expected as any);

    // Act
    const result = await controller.actualizarUsuario(id, dto, { pais: 1 } as any);

    // Assert
    expect(mockService.actualizarUsuario).toHaveBeenCalledWith(id, dto);
    expect(result).toEqual(expected);
  });
});

