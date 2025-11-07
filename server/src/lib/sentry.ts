import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export const initSentry = () => {
  if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Release tracking
    release: process.env.APP_VERSION || 'unknown',
    // Filter out health checks
    beforeSend(event, hint) {
      // Don't send health check errors
      if (event.request?.url?.includes('/health')) {
        return null;
      }
      return event;
    },
  });

  console.log('Sentry initialized for error tracking');
};

export default Sentry;

