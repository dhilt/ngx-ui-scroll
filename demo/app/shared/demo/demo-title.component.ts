import { Component, Input } from '@angular/core';

import { DemoContext } from '../interfaces';

@Component({
  selector: 'app-demo-title',
  templateUrl: './demo-title.component.html'
})
export class DemoTitleComponent {
  @Input() context: DemoContext;
}
