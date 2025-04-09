import { Component, Input } from '@angular/core';

import { IDemo } from '../../routes';

@Component({
  selector: 'app-demo-title',
  templateUrl: './demo-title.component.html',
  standalone: false
})
export class DemoTitleComponent {
  @Input() config!: IDemo;
}
