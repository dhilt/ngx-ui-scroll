import { Component } from '@angular/core';
import { merge } from 'rxjs';
import { take } from 'rxjs/operators';

import { demos } from '../../routes';
import { DemoSources, DemoSourceType } from '../../shared/interfaces';

import { Datasource, SizeStrategy } from 'ngx-ui-scroll';

interface MyItem {
  text: string;
  size: number;
}

@Component({
  selector: 'app-demo-different-heights',
  templateUrl: './different-heights.component.html'
})
export class DemoDifferentHeightsComponent {

  settingsScope = demos.settings.map;
  demoConfig = demos.settings.map.differentItemHeights;
  viewportId = 'different-heights-viewport';

  MIN = 0;
  MAX = 99;
  SIZE = 20;

  averageLog = '';
  frequentLog = '';
  log = 'average';

  constructor() {
    merge(
      this.datasourceAverage.adapter.init$,
      this.datasourceFrequent.adapter.init$
    ).pipe(take(1)).subscribe(() => this.setupLog());
  }

  setupLog() {
    const adapter1 = this.datasourceAverage.adapter;
    const adapter2 = this.datasourceFrequent.adapter;
    const wrapperElement = document.getElementById(this.viewportId as string);
    const viewports = (wrapperElement as HTMLElement).getElementsByClassName('viewport');
    const vp1 = viewports[0] as HTMLElement;
    const vp2 = viewports[1] as HTMLElement;
    adapter1.loopPending$.subscribe(pending => {
      if (!pending) {
        this.averageLog =
          `default: ${adapter1.bufferInfo.defaultSize}px, total: ${vp1.scrollHeight}px\n` + this.averageLog;
      }
    });
    adapter2.loopPending$.subscribe(pending => {
      if (!pending) {
        this.frequentLog =
          `default: ${adapter2.bufferInfo.defaultSize}px, total: ${vp2.scrollHeight}px\n` + this.frequentLog;
      }
    });
  }

  datasourceAverage = new Datasource<MyItem>({
    get: (index, count, success) =>
      success(this.getData(index, count, false)),
    settings: {
      startIndex: this.MIN,
      minIndex: this.MIN,
      maxIndex: this.MAX,
      sizeStrategy: SizeStrategy.Average
    }
  });

  datasourceFrequent = new Datasource<MyItem>({
    get: (index, count, success) =>
      success(this.getData(index, count, true)),
    settings: {
      startIndex: this.MIN,
      minIndex: this.MIN,
      maxIndex: this.MAX,
      sizeStrategy: SizeStrategy.Frequent
    }
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `MIN = 0;
MAX = 99;
SIZE = 20;

datasourceAverage = new Datasource<MyItem>({
  get: (index, count, success) =>
    success(this.getData(index, count, false)),
  settings: {
    startIndex: this.MIN,
    minIndex: this.MIN,
    maxIndex: this.MAX,
    sizeStrategy: SizeStrategy.Average
  }
});

datasourceFrequent = new Datasource<MyItem>({
  get: (index, count, success) =>
    success(this.getData(index, count, true)),
  settings: {
    startIndex: this.MIN,
    minIndex: this.MIN,
    maxIndex: this.MAX,
    sizeStrategy: SizeStrategy.Frequent
  }
});

getData(index: number, count: number, isFrequent: boolean): MyItem[] {
  const data = [];
  const start = Math.max(this.MIN, index);
  const end = Math.min(index + count - 1, this.MAX);
  for (let i = start; i <= end; i++) {
    const size = isFrequent
      ? this.SIZE * (i % 10 === 0 ? 2 : 1)
      : this.SIZE + i;
    data.push({ text: 'item #' + i, size });
  }
  return data;
}`
  }, {
    name: DemoSourceType.Template,
    active: true,
    text: `<em>average</em>
<div class="viewport">
  <div *uiScroll="let item of datasourceAverage">
     <div class="item" [style.height.px]="item.size">
      {{item.text}}
     </div>
  </div>
</div>

<em>frequent</em>
<div class="viewport">
  <div *uiScroll="let item of datasourceFrequent">
    <div class="item" [style.height.px]="item.size">
      {{item.text}}
     </div>
  </div>
</div>`
  }, {
    name: DemoSourceType.Styles,
    text: `.viewport {
  width: 150px;
  height: 250px;
  overflow-y: auto;
}
.item {
  font-weight: bold;
}`
  }];

  averageSample = 'Array.from({length: 100}).reduce((a, i, j) => a + j + 20 , 0) / 100; // 69.5px';

  getData(index: number, count: number, isFrequent: boolean): MyItem[] {
    const data = [];
    const start = Math.max(this.MIN, index);
    const end = Math.min(index + count - 1, this.MAX);
    for (let i = start; i <= end; i++) {
      const size = isFrequent
        ? this.SIZE * (i % 10 === 0 ? 2 : 1)
        : this.SIZE + i;
      data.push({ text: 'item #' + i, size });
    }
    return data;
  }

}
