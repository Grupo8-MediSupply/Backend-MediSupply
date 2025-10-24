import { Test, TestingModule } from '@nestjs/testing';
import { BodegasService } from './bodegas.service';
import { IBodegaRepository, Bodega } from '@medi-supply/bodegas-dm';
import { BodegaResponseDto } from './dtos/response/bodega.response.dto';
import { JwtPayloadDto } from '@medi-supply/shared';
import { NotFoundException } from '@nestjs/common';
import { ProductoService } from '../productos/producto.service';
import { ProductoBodega } from 'libs/domain/productos-dm/src';

describe('BodegasService', () => {
  let service: BodegasService;
  let mockProductoService: jest.Mocked<ProductoService>;
  let mockRepo: jest.Mocked<IBodegaRepository>;
  const jwt: JwtPayloadDto = {
    sub: 'user-123',
    email: 'testuser',
    pais: 1,
    role: 1,
  }

  const mockBodega = new Bodega({
    id: 'uuid-123',
    paisId: 1,
    nombre: 'Bodega Central',
    ubicacion: 'Medellín',
    capacidad: 5000,
    responsable: 'Juan Pérez',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
    estado: true,
  });

  beforeEach(async () => {
    mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPaisId: jest.fn(),
    };

    mockProductoService = {
      obtenerProductosEnBodega: jest.fn(),
    } as unknown as jest.Mocked<ProductoService>;

    service = new BodegasService(mockRepo, mockProductoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of bodegas mapped to DTOs', async () => {
      mockRepo.findAll.mockResolvedValue([mockBodega]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(BodegaResponseDto);
      expect(result[0].nombre).toBe('Bodega Central');
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return a bodega when found', async () => {
      mockRepo.findById.mockResolvedValue(mockBodega);

      const result = await service.findById('uuid-123', jwt);

      expect(result).toBeInstanceOf(BodegaResponseDto);
      expect(result?.id).toBe('uuid-123');
      expect(result?.responsable).toBe('Juan Pérez');
      expect(mockRepo.findById).toHaveBeenCalledWith('uuid-123');
    });

    it('should return not found when bodega not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById('no-existe', jwt)).rejects.toThrow(NotFoundException);
      expect(mockRepo.findById).toHaveBeenCalledWith('no-existe');
    });
  });
describe('obtenerProductosEnBodega', () => {
  it('Arrange/Act/Assert: devuelve productos cuando la bodega existe y pertenece al país', async () => {
    // Arrange
    mockRepo.findById.mockResolvedValue(mockBodega);
    const productosMock: ProductoBodega[] = [{ BodegaId: 'uuid-123', sku: 'SKU-1', cantidad: 10,loteId:'lote-001', nombreProducto:'Producto 1', productoRegionalId:'prod-reg-001', numeroLote:'NL-001' }];
    mockProductoService.obtenerProductosEnBodega.mockResolvedValue(productosMock);

    // Act
    const result = await service.obtenerProductosEnBodega('uuid-123', jwt.pais);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledWith('uuid-123');
    expect(mockProductoService.obtenerProductosEnBodega).toHaveBeenCalledWith('uuid-123');
    expect(result).toEqual(productosMock);
  });

  it('Arrange/Act/Assert: lanza NotFoundException si la bodega no existe', async () => {
    // Arrange
    mockRepo.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(service.obtenerProductosEnBodega('no-existe', jwt.pais)).rejects.toThrow(NotFoundException);
    expect(mockRepo.findById).toHaveBeenCalledWith('no-existe');
    expect(mockProductoService.obtenerProductosEnBodega).not.toHaveBeenCalled();
  });

  it('Arrange/Act/Assert: lanza NotFoundException si la bodega pertenece a otro país', async () => {
    // Arrange
    const bodega = new Bodega({
      id: 'uuid-123',
      paisId: 999,
      nombre: 'Bodega Central',
      ubicacion: 'Medellín',
      capacidad: 5000,
      responsable: 'Juan Pérez',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-02T00:00:00Z'),
      estado: true,
    });
    mockRepo.findById.mockResolvedValue(bodega);

    // Act & Assert
    await expect(service.obtenerProductosEnBodega('uuid-123', jwt.pais)).rejects.toThrow(NotFoundException);
    expect(mockRepo.findById).toHaveBeenCalledWith('uuid-123');
    expect(mockProductoService.obtenerProductosEnBodega).not.toHaveBeenCalled();
  });

  it('Arrange/Act/Assert: propaga errores del servicio de productos', async () => {
    // Arrange
    mockRepo.findById.mockResolvedValue(mockBodega);
    mockProductoService.obtenerProductosEnBodega.mockRejectedValue(new Error('service error'));

    // Act & Assert
    await expect(service.obtenerProductosEnBodega('uuid-123', jwt.pais)).rejects.toThrow('service error');
    expect(mockRepo.findById).toHaveBeenCalledWith('uuid-123');
    expect(mockProductoService.obtenerProductosEnBodega).toHaveBeenCalledWith('uuid-123');
  });
});
});
