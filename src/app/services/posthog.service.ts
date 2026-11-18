import { Injectable } from '@angular/core';
import posthog, { PostHogConfig } from 'posthog-js';

@Injectable({ providedIn: 'root' })
export class PostHogService {
  private initialized = false;

  get isInitialized(): boolean {
    return this.initialized;
  }

  get posthog(): typeof posthog {
    if (this.initialized) {
      return posthog;
    }

    return new Proxy({} as typeof posthog, {
      get: () => () => undefined,
    });
  }

  init(apiKey: string, options: Partial<PostHogConfig>): void {
    if (!this.initialized) {
      posthog.init(apiKey, options);
      this.initialized = true;
    }
  }
}
