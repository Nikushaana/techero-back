import { Module } from '@nestjs/common';
import { StreetsController } from './streets.controller';
import { StreetsService } from './streets.service';
import { GooglePlacesService } from 'src/common/services/google-places/google-places.service';

@Module({
  controllers: [StreetsController],
  providers: [GooglePlacesService, StreetsService],
  exports: [StreetsService],
})
export class StreetsModule {}
