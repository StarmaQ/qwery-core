import { NullTelemetryService } from './null-telemetry-service';
import type {
  TelemetryManager,
  TelemetryService,
  CreateTelemetryManagerOptions,
} from './types';

export function createTelemetryManager<T extends string, Config extends object>(
  options: CreateTelemetryManagerOptions<T, Config>,
): TelemetryManager {
  const activeServices = new Map<T, TelemetryService>();

  const getActiveServices = (): TelemetryService[] => {
    if (activeServices.size === 0) {
      console.debug(
        'No active telemetry services. Using NullTelemetryService.',
      );

      return [NullTelemetryService];
    }

    return Array.from(activeServices.values());
  };

  const registerActiveServices = (
    options: CreateTelemetryManagerOptions<T, Config>,
  ) => {
    Object.keys(options.providers).forEach((provider) => {
      const providerKey = provider as keyof typeof options.providers;
      const factory = options.providers[providerKey];

      if (!factory) {
        console.warn(
          `Analytics provider '${provider}' not registered. Skipping initialization.`,
        );

        return;
      }

      const service = factory();
      activeServices.set(provider as T, service);

      console.log('Initializing telemetry service', provider);
      void service.initialize();
    });
  };

  registerActiveServices(options);

  return {
    addProvider: (provider: T, config: Config) => {
      const factory = options.providers[provider];

      if (!factory) {
        console.warn(
          `Analytics provider '${provider}' not registered. Skipping initialization.`,
        );

        return Promise.resolve();
      }

      const service = factory(config);
      activeServices.set(provider, service);

      return service.initialize();
    },

    removeProvider: (provider: T) => {
      activeServices.delete(provider);
    },

    identify: (userId: string, traits?: Record<string, string>) => {
      return Promise.all(
        getActiveServices().map((service) => service.identify(userId, traits)),
      );
    },

    trackPageView: (path: string) => {
      return Promise.all(
        getActiveServices().map((service) => service.trackPageView(path)),
      );
    },

    trackError: (error: Error) => {
      return Promise.all(
        getActiveServices().map((service) => service.trackError(error)),
      );
    },

    trackUsage: (usage: string) => {
      return Promise.all(
        getActiveServices().map((service) => service.trackUsage(usage)),
      );
    },

    trackPerformance: (performance: string) => {
      return Promise.all(
        getActiveServices().map((service) =>
          service.trackPerformance(performance),
        ),
      );
    },

    trackFeatureUsage: (feature: string) => {
      return Promise.all(
        getActiveServices().map((service) =>
          service.trackFeatureUsage(feature),
        ),
      );
    },

    trackAgent: (agent: string) => {
      return Promise.all(
        getActiveServices().map((service) => service.trackAgent(agent)),
      );
    },

    trackEvent: (
      eventName: string,
      eventProperties?: Record<string, string | string[]>,
    ) => {
      return Promise.all(
        getActiveServices().map((service) =>
          service.trackEvent(eventName, eventProperties),
        ),
      );
    },
  };
}
