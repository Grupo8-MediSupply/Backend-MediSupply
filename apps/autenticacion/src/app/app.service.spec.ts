import { AppService } from './app.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Usuario } from '@medi-supply/perfiles-dm';
import type { IUsuariosRepository } from '@medi-supply/perfiles-dm';
import { UsuarioConsultaDto } from './dtos/response/usuario-consulta.dto';
import { ConfigService } from '@nestjs/config';

jest.mock('bcrypt');

describe('AppService (unit)', () => {
  let service: AppService;
  let mockRepo: jest.Mocked<IUsuariosRepository>;
  let mockJwt: jest.Mocked<JwtService>;
  let mockCConfigService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<IUsuariosRepository>;

    mockJwt = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    mockCConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    service = new AppService(mockRepo, mockJwt, mockCConfigService);
  });

  // -------------------------------------------------
  // validateUser()
  // -------------------------------------------------
  describe('validateUser', () => {
    const email = 'user@test.com';
    const password = 'plain123';
    const hashed = 'hashedPassword';

    const baseUser = {
      id: 1,
      email: { Value: email },
      password: hashed,
      rolId: 'admin',
      paisId: 'CO',
      activo: true,
    } as unknown as Usuario;

    test('lanza UnauthorizedException si no existe el usuario', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        new UnauthorizedException('Usuario no encontrado'),
      );

      expect(mockRepo.findByEmail).toHaveBeenCalledWith(email);
    });


    test('lanza UnauthorizedException si la contraseña no coincide', async () => {
      mockRepo.findByEmail.mockResolvedValue(baseUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        new UnauthorizedException('Contraseña incorrecta'),
      );
    });

    test('devuelve UsuarioConsultaDto si credenciales son válidas', async () => {
      mockRepo.findByEmail.mockResolvedValue(baseUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        id: baseUser.id,
        email: baseUser.email.Value,
        role: baseUser.rolId,
        pais: baseUser.paisId,
      });
    });
  });

  // -------------------------------------------------
  // login()
  // -------------------------------------------------
  describe('login', () => {
    const email = 'user@test.com';
    const password = 'pass123';
    const token = 'jwt.token.here';

    const userDto : UsuarioConsultaDto = {
      id: "1",
      email,
      role: 20,
      pais: 1,
    };

    beforeEach(() => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(userDto);
      mockJwt.signAsync.mockResolvedValue(token);
    });

    test('devuelve access_token si las credenciales son válidas', async () => {
      const result = await service.login(email, password);

      expect(service.validateUser).toHaveBeenCalledWith(email, password);
      expect(mockJwt.signAsync).toHaveBeenCalledWith({
        sub: userDto.id,
        email: userDto.email,
        role: userDto.role,
        pais: userDto.pais,
      }, { header: { alg: 'HS256', kid: 'mymainkey-1' } });
      expect(result).toEqual({ access_token: token });
    });

    test('propaga error si validateUser lanza excepción', async () => {
      const error = new UnauthorizedException('Credenciales inválidas');
      (service.validateUser as jest.Mock).mockRejectedValue(error);

      await expect(service.login(email, password)).rejects.toThrow(error);
      expect(mockJwt.signAsync).not.toHaveBeenCalled();
    });
  });
});
