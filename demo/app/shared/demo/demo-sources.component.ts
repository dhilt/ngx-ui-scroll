import { Component, Input } from '@angular/core';

import { DemoSources } from '../interfaces';

@Component({
  selector: 'app-demo-sources',
  templateUrl: './demo-sources.component.html'
})
export class DemoSourcesComponent {
  @Input() sources: DemoSources;
}
