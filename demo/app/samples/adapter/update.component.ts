import { Component } from '@angular/core';

import { demos } from '../../routes';
import {
  DemoContext,
  DemoSources,
  DemoSourceType
} from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from 'ngx-ui-scroll';

interface MyItem {
  text: string;
}

@Component({
  selector: 'app-demo-update',
  templateUrl: './update.component.html'
})
export class DemoUpdateComponent {
  demoContext: DemoContext = {
    config: demos.adapterMethods.map.update,
    viewportId: 'update-viewport',
    addClass: 'update',
    count: 0,
    log: ''
  };

  adapterScope = demos.adapter;
  adapterMethodsScope = demos.adapterMethods;

  MAX = 100;
  START = 1;
  fixRight = false;
  data: MyItem[];

  constructor() {
    this.data = [];
    for (let i = 0; i <= this.MAX - this.START; i++) {
      this.data.push({ text: 'item #' + (i + this.START) });
    }
  }

  datasource = new Datasource<MyItem>({
    get: (index, count, success) => {
      let data: MyItem[] = [];
      const start = index - this.START;
      const end = Math.min(start + count - 1, this.data.length - 1);
      if (start <= end) {
        data = this.data.slice(start, end + 1);
      }
      doLog(this.demoContext, index, count, data.length);
      success(data);
    },
    settings: {
      startIndex: this.START
    }
  });

  sources: DemoSources = [
    {
      name: DemoSourceType.Component,
      text: `MAX = 100;
START = 1;
fixRight = false;
data: MyItem[];

constructor() {
  this.data = [];
  for (let i = 0; i <= this.MAX - this.START; i++) {
    this.data.push({ text: 'item #' + (i + this.START) });
  }
}

datasource = new Datasource<MyItem>({
  get: (index, count, success) => {
    let data: MyItem[] = [];
    const start = index - this.START;
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

async doUpdate() {
  await this.datasource.adapter.relax();
  await this.datasource.adapter.update({
    predicate: ({ $index, data, element }) => {
      if ($index === 3) {
        // remove 3
        return false;
      }
      if (data.text === 'item #5') {
        // replace 5 with A and B
        return [{ text: 'A' }, { text: 'B' }];
      }
      if (element?.innerText.match('item #7')) {
        // append C and D to 7
        return [data, { text: 'C' }, { text: 'D' }];
      }
      // don't touch other items
      return true;
    },
    fixRight: this.fixRight
  });
}`
    },
    {
      active: true,
      name: DemoSourceType.Template,
      text: `<button (click)="doUpdate()">Run update</button>
<input type="checkbox" [(ngModel)]="fixRight"> fix right

<div class="viewport">
  <div *uiScroll="let item of datasource; let index = index">
    <div class="item">
      <span class="index">{{index}}</span>
      {{item.text}}
    </div>
  </div>
</div>`
    },
    {
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
    }
  ];

  argumentsDescription = `  AdapterReplaceOptions {
    predicate: ItemsPredicate;
    items: any[];
    fixRight?: boolean;
  }`;

  async doUpdate() {
    await this.datasource.adapter.relax();
    await this.datasource.adapter.update({
      predicate: ({ $index, data, element }) => {
        if ($index === 3) {
          // remove 3
          return false;
        }
        if (data.text === 'item #5') {
          // replace 5 with A and B
          return [{ text: 'A' }, { text: 'B' }];
        }
        if (element?.innerText.match('item #7')) {
          // append C and D to 7
          return [data, { text: 'C' }, { text: 'D' }];
        }
        // don't touch other items
        return true;
      },
      fixRight: this.fixRight
    });
  }
}
