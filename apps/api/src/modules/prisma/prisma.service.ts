import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }

  /**
   * Execute raw SQL with proper error handling
   */
  async executeRaw(sql: string, ...values: any[]): Promise<any> {
    try {
      return await this.$executeRaw`${sql}`;
    } catch (error) {
      this.logger.error(`Raw SQL execution failed: ${sql}`, error);
      throw error;
    }
  }

  /**
   * Execute raw query with proper error handling
   */
  async queryRaw<T = any>(sql: string, ...values: any[]): Promise<T[]> {
    try {
      return await this.$queryRaw`${sql}`;
    } catch (error) {
      this.logger.error(`Raw query execution failed: ${sql}`, error);
      throw error;
    }
  }

  /**
   * Transaction wrapper with retry logic
   */
  async executeTransaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.$transaction(fn);
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        if (this.isRetryableError(error) && attempt < maxRetries) {
          this.logger.warn(`Transaction attempt ${attempt} failed, retrying...`, error.message);
          await this.sleep(1000 * attempt); // Exponential backoff
          continue;
        }
        
        // Not retryable or max retries reached
        break;
      }
    }
    
    this.logger.error(`Transaction failed after ${maxRetries} attempts`);
    throw lastError;
  }

  /**
   * Check if database error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryableCodes = [
      'P2034', // Transaction conflict
      'P2028', // Transaction API error
    ];
    
    return retryableCodes.includes(error.code) || 
           error.message?.includes('connection') ||
           error.message?.includes('timeout');
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get database connection status
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    version?: string;
    latency?: number;
  }> {
    try {
      const startTime = Date.now();
      const result = await this.$queryRaw`SELECT sqlite_version() as version`;
      const latency = Date.now() - startTime;
      
      return {
        connected: true,
        version: result[0]?.version,
        latency,
      };
    } catch (error) {
      return {
        connected: false,
      };
    }
  }

  /**
   * Health check for monitoring
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: any;
  }> {
    try {
      const connectionStatus = await this.getConnectionStatus();
      
      if (!connectionStatus.connected) {
        return {
          status: 'unhealthy',
          details: { error: 'Database connection failed' },
        };
      }
      
      // Check if we can perform basic operations (SQLite version)
      const tableCount = await this.$queryRaw`
        SELECT COUNT(*) as count 
        FROM sqlite_master 
        WHERE type = 'table'
      `;
      
      return {
        status: 'healthy',
        details: {
          connected: true,
          version: connectionStatus.version,
          latency: connectionStatus.latency,
          tableCount: tableCount[0]?.count,
        },
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error.message },
      };
    }
  }
}