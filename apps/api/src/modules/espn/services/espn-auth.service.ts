import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * ESPN Authentication Service
 * Manages ESPN Fantasy Football API authentication using SWID and ESPN_S2 cookies
 * Handles cookie refresh and validation
 */
@Injectable()
export class ESPNAuthService {
  private readonly logger = new Logger(ESPNAuthService.name);
  
  private swid: string;
  private espnS2: string;
  private lastValidated: Date;
  private isAuthenticated: boolean = false;

  constructor(private readonly configService: ConfigService) {
    this.swid = this.configService.get<string>('ESPN_SWID', '');
    this.espnS2 = this.configService.get<string>('ESPN_S2', '');
    
    if (this.swid && this.espnS2) {
      this.isAuthenticated = true;
      this.lastValidated = new Date();
      this.logger.log('ESPN authentication initialized with provided credentials');
    } else {
      this.logger.warn('ESPN authentication not configured - only public leagues accessible');
    }
  }

  /**
   * Get authentication headers for API requests
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.isAuthenticated) {
      this.logger.debug('No authentication available, returning empty headers');
      return {};
    }

    // Check if credentials need validation
    if (this.shouldValidateCredentials()) {
      await this.validateCredentials();
    }

    return {
      'Cookie': this.buildCookieString(),
    };
  }

  /**
   * Refresh authentication credentials
   */
  async refreshAuth(): Promise<void> {
    this.logger.log('Refreshing ESPN authentication credentials');
    
    try {
      // In a production environment, this would:
      // 1. Use a browser automation tool to login to ESPN
      // 2. Extract fresh SWID and ESPN_S2 cookies
      // 3. Update the stored credentials
      // 
      // For now, we'll reload from environment variables
      const newSwid = this.configService.get<string>('ESPN_SWID', '');
      const newEspnS2 = this.configService.get<string>('ESPN_S2', '');
      
      if (newSwid && newEspnS2) {
        this.swid = newSwid;
        this.espnS2 = newEspnS2;
        this.isAuthenticated = true;
        this.lastValidated = new Date();
        
        this.logger.log('ESPN authentication refreshed successfully');
      } else {
        this.isAuthenticated = false;
        this.logger.error('Failed to refresh ESPN authentication - no credentials available');
      }
      
    } catch (error) {
      this.logger.error('Failed to refresh ESPN authentication:', error);
      this.isAuthenticated = false;
      throw error;
    }
  }

  /**
   * Validate current credentials
   */
  async validateCredentials(): Promise<boolean> {
    if (!this.swid || !this.espnS2) {
      this.isAuthenticated = false;
      return false;
    }

    try {
      // Test credentials with a simple API call
      const testUrl = 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024';
      
      const response = await fetch(testUrl, {
        headers: {
          'Cookie': this.buildCookieString(),
          'User-Agent': 'RFFL-Codex-DB/1.0',
        },
      });

      if (response.ok) {
        this.isAuthenticated = true;
        this.lastValidated = new Date();
        this.logger.debug('ESPN credentials validation successful');
        return true;
      } else if (response.status === 401) {
        this.logger.warn('ESPN credentials appear to be expired or invalid');
        this.isAuthenticated = false;
        return false;
      } else {
        // Other errors might be temporary
        this.logger.warn(`ESPN credential validation returned status ${response.status}`);
        return this.isAuthenticated; // Keep current status
      }
      
    } catch (error) {
      this.logger.error('Error validating ESPN credentials:', error);
      return this.isAuthenticated; // Keep current status on network errors
    }
  }

  /**
   * Check if authentication is available
   */
  isAuthAvailable(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get authentication status for monitoring
   */
  getAuthStatus(): {
    isAuthenticated: boolean;
    lastValidated?: Date;
    hasCredentials: boolean;
    credentialsAge?: number; // in milliseconds
  } {
    const credentialsAge = this.lastValidated ? 
      Date.now() - this.lastValidated.getTime() : undefined;

    return {
      isAuthenticated: this.isAuthenticated,
      lastValidated: this.lastValidated,
      hasCredentials: Boolean(this.swid && this.espnS2),
      credentialsAge,
    };
  }

  /**
   * Build cookie string for HTTP requests
   */
  private buildCookieString(): string {
    if (!this.swid || !this.espnS2) {
      return '';
    }

    return `swid=${this.swid}; espn_s2=${this.espnS2}`;
  }

  /**
   * Check if credentials should be validated
   */
  private shouldValidateCredentials(): boolean {
    if (!this.lastValidated) {
      return true;
    }

    // Validate credentials every hour
    const validationInterval = 60 * 60 * 1000; // 1 hour in milliseconds
    const timeSinceValidation = Date.now() - this.lastValidated.getTime();
    
    return timeSinceValidation > validationInterval;
  }

  /**
   * Extract SWID and ESPN_S2 from cookie string (utility method)
   */
  static parseCookieString(cookieString: string): { swid?: string; espnS2?: string } {
    const cookies: Record<string, string> = {};
    
    cookieString.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = value;
      }
    });

    return {
      swid: cookies.swid,
      espnS2: cookies.espn_s2,
    };
  }

  /**
   * Validate cookie format
   */
  static validateCookieFormat(swid: string, espnS2: string): boolean {
    // SWID should be in format: {XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}
    const swidPattern = /^\{[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\}$/;
    
    // ESPN_S2 should be a long URL-encoded string
    const espnS2Pattern = /^[A-Za-z0-9%\-._~]+$/;
    
    if (!swidPattern.test(swid)) {
      return false;
    }

    if (!espnS2Pattern.test(espnS2) || espnS2.length < 100) {
      return false;
    }

    return true;
  }

  /**
   * Set credentials programmatically (useful for testing)
   */
  setCredentials(swid: string, espnS2: string): void {
    if (!ESPNAuthService.validateCookieFormat(swid, espnS2)) {
      throw new Error('Invalid ESPN credential format');
    }

    this.swid = swid;
    this.espnS2 = espnS2;
    this.isAuthenticated = true;
    this.lastValidated = new Date();
    
    this.logger.log('ESPN credentials set programmatically');
  }

  /**
   * Clear current credentials
   */
  clearCredentials(): void {
    this.swid = '';
    this.espnS2 = '';
    this.isAuthenticated = false;
    this.lastValidated = undefined;
    
    this.logger.log('ESPN credentials cleared');
  }
}