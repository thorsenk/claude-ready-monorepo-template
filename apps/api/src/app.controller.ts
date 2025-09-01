import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        version: { type: 'string' },
        timestamp: { type: 'string' },
        database: { type: 'string' },
      }
    }
  })
  getHealth() {
    return this.appService.getHealthStatus();
  }
}