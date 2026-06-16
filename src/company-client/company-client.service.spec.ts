import { Test, TestingModule } from '@nestjs/testing';
import { CompanyClientService } from './company-client.service';

describe('CompanyClientService', () => {
  let service: CompanyClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyClientService],
    }).compile();

    service = module.get<CompanyClientService>(CompanyClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
