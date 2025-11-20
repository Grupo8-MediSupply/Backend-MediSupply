import { UsuariosService } from './usuarios.service';
import type { IUsuariosRepository, Usuario } from '@medi-supply/perfiles-dm';
import { InfoUsuarioDto } from './dto/info-usuario.dto';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let mockRepo: jest.Mocked<IUsuariosRepository>;

  beforeEach(() => {
    mockRepo = {
      findAllByPais: jest.fn(),
      updateUsuario: jest.fn(),
      // other methods not needed
    } as unknown as jest.Mocked<IUsuariosRepository>;

    service = new UsuariosService(mockRepo);
  });

  afterEach(() => jest.resetAllMocks());

  describe('obtenerUsuariosPorPais', () => {
    test('mapea correctamente la lista de usuarios', async () => {
      // Arrange
      const usuarios: Usuario[] = [
        { id: 'u1', email: 'a@b.com', rolId: 1, activo: true, tipoIdentificacion: 1, identificacion: '123' } as any,
        { id: 'u2', email: { value: 'c@d.com' }, rolId: '2' as any, activo: false, tipoIdentificacion: 2, identificacion: '456' } as any,
      ];
      mockRepo.findAllByPais.mockResolvedValue(usuarios);

      // Act
      const result = await service.obtenerUsuariosPorPais(10);

      // Assert
      expect(mockRepo.findAllByPais).toHaveBeenCalledWith(10);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBeInstanceOf(InfoUsuarioDto);
      expect(result[0].id).toBe('u1');
      expect(result[1].email).toBe('c@d.com');
    });

    test('retorna lista vacía si repo devuelve []', async () => {
      mockRepo.findAllByPais.mockResolvedValue([]);
      const result = await service.obtenerUsuariosPorPais(5);
      expect(result).toEqual([]);
    });

    test('propaga errores del repositorio', async () => {
      mockRepo.findAllByPais.mockRejectedValue(new Error('DB fail'));
      await expect(service.obtenerUsuariosPorPais(1)).rejects.toThrow('DB fail');
    });
  });

  describe('actualizarUsuario', () => {
    test('envía cambios cuando activo está definido', async () => {
      // Arrange
      mockRepo.updateUsuario.mockResolvedValue(undefined);

      // Act
      await service.actualizarUsuario('u1', { activo: false } as any);

      // Assert
      expect(mockRepo.updateUsuario).toHaveBeenCalledWith('u1', { activo: false });
    });

    test('envía cambios vacíos cuando no hay cambios explícitos', async () => {
      mockRepo.updateUsuario.mockResolvedValue(undefined);

      await service.actualizarUsuario('u2', {} as any);

      expect(mockRepo.updateUsuario).toHaveBeenCalledWith('u2', {});
    });

    test('propaga errores de updateUsuario', async () => {
      mockRepo.updateUsuario.mockRejectedValue(new Error('Update fail'));
      await expect(service.actualizarUsuario('u3', { activo: true } as any)).rejects.toThrow('Update fail');
    });
  });
});

