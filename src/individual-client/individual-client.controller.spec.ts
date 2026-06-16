import { Test, TestingModule } from '@nestjs/testing';
import { IndividualClientController } from './individual-client.controller';

describe('IndividualClientController', () => {
  let controller: IndividualClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndividualClientController],
    }).compile();

    controller = module.get<IndividualClientController>(IndividualClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
