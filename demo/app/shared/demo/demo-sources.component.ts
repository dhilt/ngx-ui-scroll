import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { DemoSources } from '../interfaces';

interface DemoSourceViewModel {
  name: string;
  text: string;
  active: boolean;
}

@Component({
  selector: 'app-demo-sources',
  templateUrl: './demo-sources.component.html',
  standalone: false
})
export class DemoSourcesComponent implements OnChanges {
  @Input() sources!: DemoSources;
  normalizedSources: DemoSourceViewModel[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['sources']) {
      return;
    }
    const sourceList = this.sources ?? [];
    const hasExplicitActive = sourceList.some(({ active }) => !!active);
    this.normalizedSources = sourceList.map((source, index) => ({
      name: String(source.name),
      text: source.text,
      active: hasExplicitActive ? !!source.active : index === 0
    }));
  }
}
