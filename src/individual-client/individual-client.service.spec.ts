import { Test, TestingModule } from '@nestjs/testing';
import { IndividualClientService } from './individual-client.service';

describe('IndividualClientService', () => {
  let service: IndividualClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndividualClientService],
    }).compile();

    service = module.get<IndividualClientService>(IndividualClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
