import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable, NgZone, Provider } from '@angular/core';
import { PostHogService } from './services/posthog.service';

@Injectable({ providedIn: 'root' })
class PostHogErrorHandler extends ErrorHandler {
  private readonly ngZone = inject(NgZone);
  private readonly posthogService = inject(PostHogService);

  override handleError(error: unknown): void {
    const extractedError = extractError(error);

    if (extractedError && this.posthogService.isInitialized) {
      this.ngZone.runOutsideAngular(() =>
        this.posthogService.posthog.captureException(extractedError),
      );
    }

    super.handleError(error);
  }
}

function extractError(errorCandidate: unknown): Error | string | null {
  const error = unwrapZoneError(errorCandidate);

  if (error instanceof HttpErrorResponse) {
    return new Error(`HTTP request failed with status ${error.status}`);
  }

  if (typeof error === 'string' || isErrorLike(error)) {
    return error;
  }

  return null;
}

function unwrapZoneError(error: unknown): unknown {
  if (
    error &&
    typeof error === 'object' &&
    'ngOriginalError' in error &&
    (error as { ngOriginalError?: unknown }).ngOriginalError
  ) {
    return (error as { ngOriginalError: unknown }).ngOriginalError;
  }

  return error;
}

function isErrorLike(value: unknown): value is Error {
  if (value instanceof Error) {
    return true;
  }

  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'name' in value &&
    'message' in value &&
    'stack' in value
  );
}

export function providePostHogErrorHandler(): Provider {
  return {
    provide: ErrorHandler,
    useClass: PostHogErrorHandler,
  };
}
