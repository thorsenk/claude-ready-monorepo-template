import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

// Initialize Sentry for NestJS backend
export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Performance monitoring
    tracesSampleRate: 1.0,
    
    // Profiling (optional - requires @sentry/profiling-node)
    profilesSampleRate: 1.0,
    
    // Environment configuration
    environment: process.env.NODE_ENV,
    
    // Release tracking
    release: process.env.npm_package_version || '1.0.0',
    
    // Integrations
    integrations: [
      new ProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: undefined }),
      new Sentry.Integrations.Postgres(),
    ],
    
    // Custom tags
    initialScope: {
      tags: {
        component: "api",
        service: "nestjs",
      },
    },

    // Error filtering
    beforeSend(event, hint) {
      // Filter out health check errors
      if (event.request?.url?.includes('/health')) {
        return null;
      }

      // Filter development errors
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry Event:', event);
        return null;
      }

      return event;
    },

    // Custom error fingerprinting
    beforeSendTransaction(event) {
      // Don't send health check transactions
      if (event.transaction?.includes('/health')) {
        return null;
      }
      return event;
    },
  });
}

// Sentry error handler middleware for NestJS
export class SentryFilter {
  catch(exception: any, host: any) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    // Capture exception with context
    Sentry.withScope((scope) => {
      scope.setTag('component', 'nestjs-filter');
      scope.setContext('request', {
        url: request.url,
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      Sentry.captureException(exception);
    });

    // Return appropriate error response
    const status = exception.getStatus ? exception.getStatus() : 500;
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || 'Internal server error',
    });
  }
}