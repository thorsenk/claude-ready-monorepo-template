import { Injectable } from '@nestjs/common';
import { PrismaService } from './modules/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'RFFL Codex DB API - Historical Fantasy Football Database';
  }

  async getHealthStatus() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: 'connected',
        services: {
          prisma: 'healthy',
          espn_api: 'ready',
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
        services: {
          prisma: 'unhealthy',
          espn_api: 'unknown',
        }
      };
    }
  }
}