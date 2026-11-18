import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { PostHogService } from './services/posthog.service';
import { PostHogLogService } from './services/posthog-log.service';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly posthogService = inject(PostHogService);
  private readonly posthogLogService = inject(PostHogLogService);
  protected readonly title = signal('bicycle-service');

  ngOnInit(): void {
    if (environment.posthogKey && environment.posthogHost) {
      this.posthogService.init(environment.posthogKey, {
        api_host: environment.posthogHost,
        defaults: '2026-08-30',
        capture_exceptions: true,
        logs: {
          serviceName: 'bicycle-service-web',
          environment: environment.production ? 'production' : 'development',
        },
      });
      this.posthogLogService.info('posthog_log_capture_initialized', {
        runtime: 'browser',
      });
      return;
    }

    if (!environment.production) {
      if (!environment.posthogKey) {
        console.error(
          'NG_APP_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NG_APP_POSTHOG_PROJECT_TOKEN is configured',
        );
      }

      if (!environment.posthogHost) {
        console.error(
          'NG_APP_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NG_APP_POSTHOG_HOST is configured',
        );
      }
    }
  }
}
