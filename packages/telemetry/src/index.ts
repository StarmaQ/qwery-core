import { createTelemetryManager } from './telemetry-manager';
import type { TelemetryManager } from './types';
import { ClientTelemetryService } from './client.telemetry.service';

export const telemetry: TelemetryManager = createTelemetryManager({
  providers: {
    telemetry: () => new ClientTelemetryService(),
  },
});

export { TelemetryProvider } from './components/telemetry-provider';
export { useTelemetry } from './hooks/use-telemetry';
export { NOTEBOOK_EVENTS, PROJECT_EVENTS } from './events';
