import { Component, Input, OnInit, TemplateRef } from '@angular/core';

import { DemoContext, DemoSources } from './interfaces';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html'
})
export class DemoComponent implements OnInit {

  init = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() datasource: any;
  @Input() context: DemoContext;
  @Input() sources: DemoSources;
  @Input() itemTemplate: TemplateRef<unknown>;

  viewport(token: string): string {
    const element = document.getElementById(token);
    if (!element) {
      return '';
    }
    const sizeToken = this.datasource.settings && this.datasource.settings.horizontal
      ? 'scrollWidth' : 'scrollHeight';
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
    setTimeout(() => {
      if (this.sources.every(s => !s.active)) {
        this.sources[0].active = true;
      }
      this.init = true;
    });
  }

}
