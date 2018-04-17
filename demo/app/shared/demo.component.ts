import { Component, Input } from '@angular/core';
import { DemoData, DemoSources } from './interfaces';

import { Datasource } from '../../../public_api';
// import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html'
})
export class DemoComponent {

  @Input() datasource: Datasource;
  @Input() data: DemoData;
  @Input() log: string;
  @Input() sources: DemoSources;

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
