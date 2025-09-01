import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ESPNApiService } from './services/espn-api.service';
import { ESPNAuthService } from './services/espn-auth.service';
import { DataTransformService } from './services/data-transform.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { ESPNDataController } from './controllers/espn-data.controller';
import { DataIngestionService } from './services/data-ingestion.service';
import { DataValidationService } from './services/data-validation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],
  controllers: [
    ESPNDataController,
  ],
  providers: [
    ESPNApiService,
    ESPNAuthService,
    DataTransformService,
    RateLimiterService,
    DataIngestionService,
    DataValidationService,
  ],
  exports: [
    ESPNApiService,
    DataIngestionService,
    DataTransformService,
    DataValidationService,
  ],
})
export class ESPNIntegrationModule {}