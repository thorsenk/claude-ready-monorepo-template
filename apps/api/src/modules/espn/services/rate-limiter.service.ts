import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimitConfig, RateLimitState } from '../types/internal-data.types';

/**
 * Rate Limiter Service
 * Conservative rate limiting for ESPN API to prevent blocking
 * Implements token bucket algorithm with burst capacity and cooldown
 */
@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  
  private readonly config: RateLimitConfig;
  private state: RateLimitState;
  private tokenBucket: number;
  private lastRefillTime: Date;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      requestsPerSecond: this.configService.get<number>('ESPN_RATE_LIMIT_PER_SECOND', 1),
      burstCapacity: this.configService.get<number>('ESPN_BURST_CAPACITY', 10),
      cooldownPeriod: this.configService.get<number>('ESPN_COOLDOWN_PERIOD', 60000), // 60 seconds
    };

    this.state = {
      requestCount: 0,
      windowStart: new Date(),
      isInCooldown: false,
    };

    this.tokenBucket = this.config.burstCapacity;
    this.lastRefillTime = new Date();

    this.logger.log(`Rate limiter initialized: ${this.config.requestsPerSecond} req/sec, burst: ${this.config.burstCapacity}`);
  }

  /**
   * Wait for available request slot
   */
  async waitForSlot(): Promise<void> {
    // Check if in cooldown period
    if (this.state.isInCooldown) {
      await this.waitForCooldownEnd();
    }

    // Refill token bucket
    await this.refillTokenBucket();

    // If no tokens available, wait
    if (this.tokenBucket <= 0) {
      const waitTime = 1000 / this.config.requestsPerSecond;
      this.logger.debug(`No tokens available, waiting ${waitTime}ms`);
      await this.sleep(waitTime);
      await this.refillTokenBucket();
    }

    // Consume token
    this.tokenBucket = Math.max(0, this.tokenBucket - 1);
    this.state.requestCount++;

    this.logger.debug(`Token consumed. Remaining: ${this.tokenBucket}, Total requests: ${this.state.requestCount}`);
  }

  /**
   * Handle rate limit hit from API response
   */
  async handleRateLimit(): Promise<void> {
    this.logger.warn('Rate limit hit detected from API response');
    
    // Enter cooldown mode
    this.state.isInCooldown = true;
    this.state.cooldownEnd = new Date(Date.now() + this.config.cooldownPeriod);
    
    // Reset token bucket
    this.tokenBucket = 0;
    
    this.logger.warn(`Entering cooldown period until ${this.state.cooldownEnd.toISOString()}`);
    
    // Wait for cooldown
    await this.waitForCooldownEnd();
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): {
    tokensRemaining: number;
    requestCount: number;
    isInCooldown: boolean;
    cooldownEndsAt?: Date;
  } {
    return {
      tokensRemaining: this.tokenBucket,
      requestCount: this.state.requestCount,
      isInCooldown: this.state.isInCooldown,
      cooldownEndsAt: this.state.cooldownEnd,
    };
  }

  /**
   * Reset rate limiter state (useful for testing)
   */
  reset(): void {
    this.state = {
      requestCount: 0,
      windowStart: new Date(),
      isInCooldown: false,
    };
    this.tokenBucket = this.config.burstCapacity;
    this.lastRefillTime = new Date();
    
    this.logger.debug('Rate limiter state reset');
  }

  /**
   * Refill token bucket based on elapsed time
   */
  private async refillTokenBucket(): Promise<void> {
    const now = new Date();
    const timeSinceRefill = now.getTime() - this.lastRefillTime.getTime();
    
    // Calculate tokens to add based on time elapsed
    const tokensToAdd = Math.floor(timeSinceRefill / 1000) * this.config.requestsPerSecond;
    
    if (tokensToAdd > 0) {
      this.tokenBucket = Math.min(
        this.config.burstCapacity,
        this.tokenBucket + tokensToAdd
      );
      this.lastRefillTime = now;
      
      this.logger.debug(`Refilled ${tokensToAdd} tokens. Current: ${this.tokenBucket}`);
    }
  }

  /**
   * Wait for cooldown period to end
   */
  private async waitForCooldownEnd(): Promise<void> {
    if (!this.state.isInCooldown || !this.state.cooldownEnd) {
      return;
    }

    const now = new Date();
    
    if (now >= this.state.cooldownEnd) {
      // Cooldown period ended
      this.state.isInCooldown = false;
      this.state.cooldownEnd = undefined;
      this.tokenBucket = this.config.burstCapacity; // Reset to full capacity
      this.logger.log('Cooldown period ended, rate limiter ready');
      return;
    }

    // Still in cooldown, wait for it to end
    const waitTime = this.state.cooldownEnd.getTime() - now.getTime();
    this.logger.debug(`Waiting for cooldown to end in ${waitTime}ms`);
    
    await this.sleep(waitTime);
    
    // Re-check status after waiting
    await this.waitForCooldownEnd();
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  calculateBackoffDelay(
    attempt: number,
    baseDelay: number = 1000,
    maxDelay: number = 30000,
    jitter: boolean = true
  ): number {
    // Exponential backoff: delay = baseDelay * (2 ^ attempt)
    let delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    
    if (jitter) {
      // Add jitter: random value between 0.5 and 1.5 times the delay
      const jitterMultiplier = 0.5 + Math.random();
      delay = Math.floor(delay * jitterMultiplier);
    }
    
    return delay;
  }

  /**
   * Execute function with retry logic and rate limiting
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Wait for rate limit slot
        await this.waitForSlot();
        
        // Execute operation
        const result = await operation();
        
        if (attempt > 0) {
          this.logger.log(`${context} succeeded after ${attempt} retries`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Check if it's a rate limit error
        if (this.isRateLimitError(error)) {
          this.logger.warn(`Rate limit error during ${context}, attempt ${attempt + 1}/${maxRetries + 1}`);
          await this.handleRateLimit();
        } else {
          this.logger.warn(`Error during ${context}, attempt ${attempt + 1}/${maxRetries + 1}:`, error.message);
        }
        
        // Don't retry if this was the last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Calculate backoff delay
        const delay = this.calculateBackoffDelay(attempt);
        this.logger.debug(`Waiting ${delay}ms before retry`);
        await this.sleep(delay);
      }
    }
    
    // All retries exhausted
    this.logger.error(`${context} failed after ${maxRetries + 1} attempts`);
    throw lastError;
  }

  /**
   * Check if error is related to rate limiting
   */
  private isRateLimitError(error: any): boolean {
    if (!error.status && !error.response?.status) {
      return false;
    }
    
    const status = error.status || error.response?.status;
    return status === 429 || status === 503;
  }

  /**
   * Get rate limit metrics for monitoring
   */
  getMetrics(): {
    totalRequests: number;
    requestsThisWindow: number;
    tokensRemaining: number;
    isInCooldown: boolean;
    averageRequestsPerSecond: number;
  } {
    const now = new Date();
    const windowDuration = now.getTime() - this.state.windowStart.getTime();
    const averageRequestsPerSecond = windowDuration > 0 ? 
      (this.state.requestCount * 1000) / windowDuration : 0;
    
    return {
      totalRequests: this.state.requestCount,
      requestsThisWindow: this.state.requestCount,
      tokensRemaining: this.tokenBucket,
      isInCooldown: this.state.isInCooldown,
      averageRequestsPerSecond,
    };
  }
}