import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    external: ServiceHealth[];
  };
  metrics: {
    memory: MemoryMetrics;
    cpu: CPUMetrics;
    requests: RequestMetrics;
  };
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastChecked: string;
  error?: string;
}

interface MemoryMetrics {
  used: number;
  total: number;
  percentage: number;
  heap: {
    used: number;
    total: number;
  };
}

interface CPUMetrics {
  percentage: number;
  loadAverage: number[];
}

interface RequestMetrics {
  total: number;
  perMinute: number;
  errors: number;
  errorRate: number;
}

export class HealthCheckService {
  private prisma: PrismaClient;
  private redis: Redis;
  private startTime: number;
  private requestCount: number = 0;
  private errorCount: number = 0;

  constructor(prisma: PrismaClient, redis: Redis) {
    this.prisma = prisma;
    this.redis = redis;
    this.startTime = Date.now();
  }

  // Main health check endpoint
  async getHealthStatus(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    // Check all services in parallel
    const [database, redisHealth, externalServices] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices()
    ]);

    // Get system metrics
    const metrics = this.getSystemMetrics();

    // Determine overall status
    const overallStatus = this.determineOverallStatus([
      database.status,
      redisHealth.status,
      ...externalServices.map(s => s.status)
    ]);

    return {
      status: overallStatus,
      timestamp,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database,
        redis: redisHealth,
        external: externalServices
      },
      metrics
    };
  }

  // Database health check
  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Simple query to test database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      
      return {
        name: 'PostgreSQL',
        status: responseTime < 100 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'PostgreSQL',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Redis health check
  private async checkRedis(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      await this.redis.ping();
      
      const responseTime = Date.now() - startTime;
      
      return {
        name: 'Redis',
        status: responseTime < 50 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'Redis',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // External services health check
  private async checkExternalServices(): Promise<ServiceHealth[]> {
    const externalServices = [
      { name: 'Stripe API', url: 'https://api.stripe.com/v1' },
      { name: 'SendGrid API', url: 'https://api.sendgrid.com/v3' },
      { name: 'Sentry', url: 'https://sentry.io/api/0/' }
    ];

    const checks = externalServices.map(async service => {
      const startTime = Date.now();
      
      try {
        const response = await fetch(service.url, {
          method: 'HEAD',
          timeout: 5000
        });
        
        const responseTime = Date.now() - startTime;
        
        return {
          name: service.name,
          status: response.ok ? 
            (responseTime < 1000 ? 'healthy' : 'degraded') : 
            'unhealthy',
          responseTime,
          lastChecked: new Date().toISOString(),
          ...(response.ok ? {} : { error: `HTTP ${response.status}` })
        } as ServiceHealth;
      } catch (error) {
        return {
          name: service.name,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          lastChecked: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        } as ServiceHealth;
      }
    });

    return Promise.all(checks);
  }

  // System metrics
  private getSystemMetrics(): {
    memory: MemoryMetrics;
    cpu: CPUMetrics;
    requests: RequestMetrics;
  } {
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const loadAverage = require('os').loadavg();
    
    const uptime = Date.now() - this.startTime;
    const uptimeMinutes = uptime / (1000 * 60);
    
    return {
      memory: {
        used: memoryUsage.rss,
        total: totalMemory,
        percentage: (memoryUsage.rss / totalMemory) * 100,
        heap: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal
        }
      },
      cpu: {
        percentage: process.cpuUsage().user / 1000000, // Convert to seconds
        loadAverage
      },
      requests: {
        total: this.requestCount,
        perMinute: Math.round(this.requestCount / Math.max(uptimeMinutes, 1)),
        errors: this.errorCount,
        errorRate: this.requestCount > 0 ? 
          (this.errorCount / this.requestCount) * 100 : 0
      }
    };
  }

  // Determine overall status from individual service statuses
  private determineOverallStatus(statuses: Array<'healthy' | 'unhealthy' | 'degraded'>): 
    'healthy' | 'unhealthy' | 'degraded' {
    
    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    }
    
    if (statuses.includes('degraded')) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  // Middleware to track requests
  trackRequest(error?: boolean) {
    this.requestCount++;
    if (error) {
      this.errorCount++;
    }
  }
}

// Express middleware for health checks
export function createHealthCheckMiddleware(
  prisma: PrismaClient, 
  redis: Redis
) {
  const healthService = new HealthCheckService(prisma, redis);

  return {
    // Full health check
    health: async (req: Request, res: Response) => {
      try {
        const healthStatus = await healthService.getHealthStatus();
        
        const statusCode = healthStatus.status === 'healthy' ? 200 : 
                          healthStatus.status === 'degraded' ? 200 : 503;
        
        res.status(statusCode).json(healthStatus);
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },

    // Simple readiness check
    ready: async (req: Request, res: Response) => {
      try {
        // Check critical services only
        const database = await healthService['checkDatabase']();
        
        if (database.status === 'unhealthy') {
          return res.status(503).json({ status: 'not ready' });
        }
        
        res.status(200).json({ status: 'ready' });
      } catch (error) {
        res.status(503).json({ status: 'not ready' });
      }
    },

    // Liveness check - simpler check for basic functionality
    live: (req: Request, res: Response) => {
      res.status(200).json({ 
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: Date.now() - healthService['startTime']
      });
    },

    // Request tracking middleware
    trackRequests: (req: Request, res: Response, next: NextFunction) => {
      res.on('finish', () => {
        const isError = res.statusCode >= 400;
        healthService.trackRequest(isError);
      });
      next();
    }
  };
}