import { Test, TestingModule } from '@nestjs/testing';
import { CompanyClientController } from './company-client.controller';

describe('CompanyClientController', () => {
  let controller: CompanyClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyClientController],
    }).compile();

    controller = module.get<CompanyClientController>(CompanyClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
