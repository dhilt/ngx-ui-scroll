import { Component, Input } from '@angular/core';
import { DemoContext, DemoSources } from './interfaces';

import { Datasource } from '../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html'
})
export class DemoComponent {

  @Input() datasource: Datasource;
  @Input() context: DemoContext;
  @Input() sources: DemoSources;

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

  constructor() {
  }

}
