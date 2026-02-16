import {
  Component,
  Injector,
  Input,
  OnInit,
  Signal,
  TemplateRef,
  inject,
  signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { delay, filter, map, startWith } from 'rxjs/operators';

import { DemoContext, DemoSources } from './interfaces';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  standalone: false
})
export class DemoComponent implements OnInit {
  private injector = inject(Injector);

  init = signal(false);
  metrics: Signal<{ viewportSize: string; domElementsCount: string }> = signal({
    viewportSize: '',
    domElementsCount: ''
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() datasource: any;
  @Input() context!: DemoContext;
  @Input() sources!: DemoSources;
  @Input() itemTemplate!: TemplateRef<unknown>;

  viewport(token: string): string {
    const element = document.getElementById(token);
    if (!element) {
      return '';
    }
    const sizeToken =
      this.datasource.settings && this.datasource.settings.horizontal
        ? 'scrollWidth'
        : 'scrollHeight';
    return element[sizeToken].toString();
  }

  elements(token: string): string {
    const element = document.getElementById(token);
    if (!element) {
      return '';
    }
    const count = element.children[0].childElementCount || 0;
    return (count - 2).toString(10);
  }

  ngOnInit() {
    this.metrics = toSignal(
      (this.datasource?.adapter?.loopPending$ ?? of(false)).pipe(
        filter((pending: boolean) => !pending),
        startWith(false),
        map(() => this.context?.viewportId || this.context?.config?.id || ''),
        filter((token: string) => !!token && !!document.getElementById(token)),
        delay(0),
        map((token: string) => ({
          viewportSize: this.viewport(token),
          domElementsCount: this.elements(token)
        }))
      ),
      {
        initialValue: { viewportSize: '', domElementsCount: '' },
        injector: this.injector
      }
    );

    setTimeout(() => {
      if (this.sources.every(s => !s.active)) {
        this.sources[0].active = true;
      }
      this.init.set(true);
    });
  }
}
