import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource, IAdapter } from '../../../../public_api'; // from 'ngx-ui-scroll';

interface MyItem {
  text: string;
}

@Component({
  selector: 'app-demo-replace',
  templateUrl: './replace.component.html'
})
export class DemoReplaceComponent {

  demoContext: DemoContext = {
    config: demos.adapter.map.replace,
    viewportId: `replace-viewport`,
    addClass: `replace`,
    count: 0,
    log: ''
  };

  adapterScope = demos.adapter;

  MAX = 100;
  data: MyItem[];

  constructor() {
    this.data = [];
    for (let i = 0; i < this.MAX; i++) {
      this.data.push({ text: 'item #' + (i + 1) });
    }
  }

  datasource = new Datasource<IAdapter<MyItem>>({
    get: (start: number, count: number, success: Function) => {
      let data: MyItem[] = [];
      const end = Math.min(start + count - 1, this.data.length - 1);
      if (start <= end) {
        data = this.data.slice(start, end + 1);
      }
      doLog(this.demoContext, start, count, data.length);
      success(data);
    },
    settings: {
      startIndex: 0
    }
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `MAX = 100;
data: Item[];

constructor() {
  this.data = [];
  for (let i = 0; i < this.MAX; i++) {
    this.data.push({ text: 'item #' + (i + 1) });
  }
}

datasource = new Datasource({
  get: (start: number, count: number, success: Function) => {
    let data: Item[] = [];
    const end = Math.min(start + count - 1, this.data.length - 1);
    if (start <= end) {
      data = this.data.slice(start, end + 1);
    }
    success(data);
  },
  settings: {
    startIndex: 0
  }
});

async doReplace() {
  await this.datasource.adapter.relax();
  const toRemove = [3, 4, 5];
  const newItems: Item[] = [{ text: 'X' }, { text: 'Y' }];
  this.data = [
    ...this.data.slice(0, toRemove[0]),
    ...newItems,
    ...this.data.slice(toRemove[toRemove.length - 1])
  ];
  await this.datasource.adapter.replace({
    predicate: ({ $index }) => toRemove.includes($index),
    items: newItems
  });
}`
  }, {
    active: true,
    name: DemoSourceType.Template,
    text: `<button (click)="doReplace()">3, 4, 5 to X, Y</button>

<div class="viewport">
  <div *uiScroll="let item of datasource; let index = index">
    <div class="item">
      <span class="index">{{index}}</span>
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
  height: 25px;
}
.index {
  font-weight: normal;
  font-size: smaller;
}`
  }];

  argumentsDescription = `  AdapterReplaceOptions {
    predicate: ItemsPredicate;
    items: any[];
    fixRight?: boolean;
  }`;

  async doReplace() {
    await this.datasource.adapter.relax();
    const toRemove = [3, 4, 5];
    const newItems: MyItem[] = [{ text: 'X' }, { text: 'Y' }];
    this.data = [
      ...this.data.slice(0, toRemove[0]),
      ...newItems,
      ...this.data.slice(toRemove[toRemove.length - 1])
    ];
    await this.datasource.adapter.replace({
      predicate: ({ $index }) => toRemove.includes($index),
      items: newItems
    });
  }

}
