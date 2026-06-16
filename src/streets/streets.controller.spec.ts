import { Test, TestingModule } from '@nestjs/testing';
import { StreetsController } from './streets.controller';

describe('StreetsController', () => {
  let controller: StreetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreetsController],
    }).compile();

    controller = module.get<StreetsController>(StreetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
