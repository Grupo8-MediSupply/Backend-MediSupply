import { Test, TestingModule } from '@nestjs/testing';
import { GcpStorageService } from './gcp-storage.service';
import { ConfigService } from '@nestjs/config';
import { Storage, Bucket, File } from '@google-cloud/storage';

// 🔹 Mocks de dependencias
jest.mock('@google-cloud/storage');

describe('GcpStorageService', () => {
  let service: GcpStorageService;
  let mockStorage: jest.Mocked<Storage>;
  let mockBucket: jest.Mocked<Bucket>;
  let mockFile: jest.Mocked<File>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // Arrange
    mockFile = {
      save: jest.fn().mockResolvedValue(undefined),
      getSignedUrl: jest.fn().mockResolvedValue(['https://signed-url']),
    } as unknown as jest.Mocked<File>;

    mockBucket = {
      file: jest.fn().mockReturnValue(mockFile),
    } as unknown as jest.Mocked<Bucket>;

    mockStorage = {
      bucket: jest.fn().mockReturnValue(mockBucket),
    } as unknown as jest.Mocked<Storage>;

    (Storage as unknown as jest.Mock).mockImplementation(() => mockStorage);

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'GCP_PROJECT_ID') return 'test-project';
        if (key === 'GCP_BUCKET_NAME') return 'test-bucket';
        if (key === 'GCP_KEYFILE_PATH') return '/tmp/key.json';
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GcpStorageService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<GcpStorageService>(GcpStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // 🧩 TEST: Instanciación
  // ==========================================
  it('debería crearse correctamente', () => {
    // Assert
    expect(service).toBeDefined();
    expect(mockConfigService.get).toHaveBeenCalledWith('GCP_PROJECT_ID');
    expect(mockConfigService.get).toHaveBeenCalledWith('GCP_BUCKET_NAME', '');
  });

  // ==========================================
  // 🧩 TEST: uploadBuffer()
  // ==========================================
  it('debería subir un buffer y retornar signedUrl, objectUrl y path', async () => {
    // Arrange
    const buffer = Buffer.from('test-data');
    const mimetype = 'video/mp4';
    const originalName = 'video.mp4';

    // Act
    const result = await service.uploadBuffer(buffer, mimetype, originalName);

    // Assert
    expect(mockStorage.bucket).toHaveBeenCalledWith('test-bucket');
    expect(mockBucket.file).toHaveBeenCalledTimes(1);
    expect(mockFile.save).toHaveBeenCalledWith(buffer, expect.objectContaining({
      resumable: false,
      contentType: mimetype,
    }));
    expect(mockFile.getSignedUrl).toHaveBeenCalledWith(expect.objectContaining({
      action: 'read',
    }));

    expect(result.signedUrl).toBe('https://signed-url');
    expect(result.objectUrl).toMatch(/^https:\/\/storage\.googleapis\.com\/test-bucket\/videos\//);
    expect(result.path).toMatch(/^videos\/.*\.mp4$/);
  });

  // ==========================================
  // 🧩 TEST: getSignedUrl()
  // ==========================================
  it('debería generar una nueva URL firmada para un archivo existente', async () => {
    // Arrange
    const testPath = 'videos/example.mp4';

    // Act
    const url = await service.getSignedUrl(testPath);

    // Assert
    expect(mockStorage.bucket).toHaveBeenCalledWith('test-bucket');
    expect(mockBucket.file).toHaveBeenCalledWith(testPath);
    expect(mockFile.getSignedUrl).toHaveBeenCalledWith(expect.objectContaining({
      action: 'read',
    }));
    expect(url).toBe('https://signed-url');
  });

  // ==========================================
  // 🧩 TEST: Manejo de error en uploadBuffer()
  // ==========================================
  it('debería lanzar un error si file.save falla', async () => {
    // Arrange
    mockFile.save.mockRejectedValueOnce(new Error('Error al guardar archivo'));
    const buffer = Buffer.from('test-data');

    // Act & Assert
    await expect(
      service.uploadBuffer(buffer, 'video/mp4', 'video.mp4')
    ).rejects.toThrow('Error al guardar archivo');
  });
});
