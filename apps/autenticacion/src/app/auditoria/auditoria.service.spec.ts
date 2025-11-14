import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaService } from './auditoria.service';
import { Auditoria } from '@medi-supply/perfiles-dm';

describe('AuditoriaService', () => {
  let service: AuditoriaService;
  let mockRepo: { guardarAuditoria: jest.Mock };

  beforeEach(async () => {
    mockRepo = { guardarAuditoria: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaService,
        { provide: 'IAuditoriaRepository', useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AuditoriaService>(AuditoriaService);
  });

  afterEach(() => jest.resetAllMocks());

  it('crearAuditoria - delega en el repositorio (AAA)', async () => {
    // Arrange
    const audit: Auditoria = { id: 'a1', action: 'test', module: 'm', createdAt: new Date() } as any;
    (mockRepo.guardarAuditoria as jest.Mock).mockResolvedValue(undefined);

    // Act
    await service.crearAuditoria(audit);

    // Assert
    expect(mockRepo.guardarAuditoria).toHaveBeenCalledWith(audit);
  });

  it('crearAuditoria - propaga errores del repositorio (AAA)', async () => {
    // Arrange
    const audit: Auditoria = { id: 'a2', action: 'fail', module: 'm', createdAt: new Date() } as any;
    (mockRepo.guardarAuditoria as jest.Mock).mockRejectedValue(new Error('DB fail'));

    // Act & Assert
    await expect(service.crearAuditoria(audit)).rejects.toThrow('DB fail');
    expect(mockRepo.guardarAuditoria).toHaveBeenCalledWith(audit);
  });
});
