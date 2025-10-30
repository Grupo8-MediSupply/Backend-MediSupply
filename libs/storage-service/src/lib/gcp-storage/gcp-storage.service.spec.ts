import { Test, TestingModule } from '@nestjs/testing';
import { GcpStorageService } from './gcp-storage.service';

describe('GcpStorageService', () => {
  let service: GcpStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GcpStorageService],
    }).compile();

    service = module.get<GcpStorageService>(GcpStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
