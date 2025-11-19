import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaService } from './auditoria.service';
import { Auditoria } from '@medi-supply/perfiles-dm';

describe('AuditoriaService', () => {
  let service: AuditoriaService;
  let mockRepo: { guardarAuditoria: jest.Mock; listarAuditorias: jest.Mock };

  beforeEach(async () => {
    mockRepo = {
      guardarAuditoria: jest.fn(),
      listarAuditorias: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaService,
        { provide: 'IAuditoriaRepository', useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AuditoriaService>(AuditoriaService);
  });

  afterEach(() => jest.resetAllMocks());

  it('crearAuditoria delega en el repositorio', async () => {
    const audit = new Auditoria({
      accion: 'TEST',
      email: 'user@example.com',
      ip: '127.0.0.1',
      detalles: {},
      fecha: new Date(),
    });
    mockRepo.guardarAuditoria.mockResolvedValue(undefined);

    await service.crearAuditoria(audit);

    expect(mockRepo.guardarAuditoria).toHaveBeenCalledWith(audit);
  });

  it('crearAuditoria propaga errores del repositorio', async () => {
    const audit = new Auditoria({
      accion: 'FAIL',
      email: 'user@example.com',
      ip: '127.0.0.1',
      detalles: {},
      fecha: new Date(),
    });
    mockRepo.guardarAuditoria.mockRejectedValue(new Error('DB fail'));

    await expect(service.crearAuditoria(audit)).rejects.toThrow('DB fail');
    expect(mockRepo.guardarAuditoria).toHaveBeenCalledWith(audit);
  });

  it('listarAuditorias convierte fechas y delega en el repositorio', async () => {
    const filtros = {
      usuario: 'admin',
      accion: 'LOGIN',
      fechaDesde: '2024-01-01',
      fechaHasta: '2024-01-31',
    };
    mockRepo.listarAuditorias.mockResolvedValue([]);

    await service.listarAuditorias(filtros as any);

    expect(mockRepo.listarAuditorias).toHaveBeenCalledWith({
      usuario: 'admin',
      accion: 'LOGIN',
      fechaDesde: new Date('2024-01-01'),
      fechaHasta: new Date('2024-01-31'),
    });
  });
});
