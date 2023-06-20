import { Component } from '@angular/core';

import { demos } from '../../routes';
import {
  DemoContext,
  DemoSources,
  DemoSourceType,
  MyItem
} from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-append-prepend-sync',
  templateUrl: './append-prepend-sync.component.html'
})
export class DemoAppendPrependSyncComponent {
  demoContext: DemoContext = {
    config: demos.adapterMethods.map.appendPrependSync,
    viewportId: 'append-prepend-sync-viewport',
    count: 0,
    log: ''
  };

  adapterScope = demos.adapter;
  adapterPropsScope = demos.adapterProps;
  adapterMethodsScope = demos.adapterMethods;

  inputPrepend = 4;
  inputAppend = 4;
  increasePrepend = false;
  decreaseAppend = false;

  MIN = 1;
  MAX = 100;
  data: MyItem[];
  absMinIndex = this.MIN;
  absMaxIndex = this.MAX;

  constructor() {
    this.data = [];
    for (let i = this.MIN; i <= this.MAX; i++) {
      this.data.push({ id: i, text: 'item #' + i });
    }
  }

  datasource = new Datasource<MyItem>({
    get: (index, count, success) => {
      const data: MyItem[] = [];
      const start = index;
      const end = start + count - 1;
      for (let i = start; i <= end; i++) {
        const _index = i - this.MIN;
        if (_index >= 0 && _index < this.data.length) {
          data.push(this.data[_index]);
        }
      }
      doLog(this.demoContext, index, count, data.length);
      success(data);
    },
    settings: {
      startIndex: Math.round((this.MAX - this.MIN) / 2)
    }
  });

  sources: DemoSources = [
    {
      name: DemoSourceType.Component,
      text: `inputPrepend = 4;
inputAppend = 4;
increasePrepend = false;
decreaseAppend = false;
    
MIN = 1;
MAX = 100;
data: MyItem[];
absMinIndex = this.MIN;
absMaxIndex = this.MAX;

constructor() {
  this.data = [];
  for (let i = this.MIN; i <= this.MAX; i++) {
    this.data.push({ text: 'item #' + i });
  }
}

datasource = new Datasource<MyItem>({
  get: (index, count, success) => {
    const data: MyItem[] = [];
    const start = index;
    const end = start + count - 1;
    for (let i = start; i <= end; i++) {
      const _index = i - this.MIN;
      if (_index >= 0 && _index < this.data.length) {
        data.push(this.data[_index]);
      }
    }
    success(data);
  },
  settings: {
    startIndex: Math.round((this.MAX - this.MIN) / 2)
  }
});

async doPrepend() {
  await this.datasource.adapter.relax();
  const items = [];
  for (let i = 0; i < this.inputPrepend; i++) {
    if (!this.increasePrepend) {
      this.MIN--;
    } else {
      this.MAX++;
    }
    this.absMinIndex--;
    const newItem: MyItem = {
      text: 'item #' + this.absMinIndex + '*'
    };
    this.data.unshift(newItem);
    items.push(newItem);
  }
  this.datasource.adapter.prepend({
    items, bof: true, increase: this.increasePrepend
  });
}

async doAppend() {
  await this.datasource.adapter.relax();
  const items = [];
  for (let i = 0; i < this.inputAppend; i++) {
    if (!this.decreaseAppend) {
      this.MAX++;
    } else {
      this.MIN--;
    }
    this.absMaxIndex++;
    const newItem: MyItem = {
      text: 'item #' + this.absMaxIndex + '*'
    };
    this.data.push(newItem);
    items.push(newItem);
  }
  this.datasource.adapter.append({
    items, eof: true, decrease: this.decreaseAppend
  });
}`
    },
    {
      active: true,
      name: DemoSourceType.Template,
      text: `<button (click)="doPrepend()">Prepend</button>
<input [ngModel]="inputPrepend" size="2"> items
{{increasePrepend ? 'increasingly' : 'decreasingly'}}
<input type="checkbox" [(ngModel)]="increasePrepend">
<br>
<button (click)="doAppend()">Append</button>
<input [ngModel]="inputAppend" size="2"> items
{{decreaseAppend ? 'decreasingly' : 'increasingly'}}
<input type="checkbox" [(ngModel)]="decreaseAppend">

<div class="viewport">
  <div *uiScroll="let item of datasource; let index = index">
    <div class="item">
      <span class="index">{{index}})</span> {{item.text}}
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
}`
    }
  ];

  prependCallSample = 'Adapter.prepend({ items, bof: true })';
  appendCallSample = 'Adapter.append({ items, eof: true })';
  prependIncreaseCallSample = 'Adapter.prepend({ items, increase: true })';

  onInputChanged(isPrepend: boolean, target: HTMLInputElement) {
    const value = parseInt(target.value.trim(), 10);
    target.value = value.toString();
    if (isPrepend) {
      this.inputPrepend = value;
    } else {
      this.inputAppend = value;
    }
  }

  async doPrepend() {
    await this.datasource.adapter.relax();
    const items = [];
    for (let i = 0; i < this.inputPrepend; i++) {
      if (!this.increasePrepend) {
        this.MIN--;
      } else {
        this.MAX++;
      }
      this.absMinIndex--;
      const newItem: MyItem = {
        id: 'x',
        text: 'item #' + this.absMinIndex + '*'
      };
      this.data.unshift(newItem);
      items.push(newItem);
    }
    this.datasource.adapter.prepend({
      items,
      bof: true,
      increase: this.increasePrepend
    });
  }

  async doAppend() {
    await this.datasource.adapter.relax();
    const items = [];
    for (let i = 0; i < this.inputAppend; i++) {
      if (!this.decreaseAppend) {
        this.MAX++;
      } else {
        this.MIN--;
      }
      this.absMaxIndex++;
      const newItem: MyItem = {
        id: 'x',
        text: 'item #' + this.absMaxIndex + '*'
      };
      this.data.push(newItem);
      items.push(newItem);
    }
    this.datasource.adapter.append({
      items,
      eof: true,
      decrease: this.decreaseAppend
    });
  }
}
