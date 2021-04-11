import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoContext, DemoSources, DemoSourceType, MyItem } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

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

  MIN = 100;
  MAX = 200;
  data: MyItem[];

  constructor() {
    this.data = [];
    for (let i = this.MIN; i <= this.MAX; i++) {
      this.data.push({ id: i, text: 'item #' + i });
    }
  }

  datasource = new Datasource<MyItem>({
    get: (index, count, success) => {
      const data = [];
      for (let i = index; i < index + count; i++) {
        const found = this.data.find(item => item.id === i);
        if (found) {
          data.push(found);
        }
      }
      doLog(this.demoContext, index, count, data.length);
      success(data);
    },
    settings: {
      startIndex: this.MIN
    }
  });

  datasourceIndex = new Datasource<MyItem>({
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
      startIndex: this.MIN
    }
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `MIN = 100;
MAX = 200;
inputValue = 1;
data: MyItem[];

constructor() {
  this.data = [];
  for (let i = this.MIN; i <= this.MAX; i++) {
    this.data.push({ id: i, text: 'item #' + i });
  }
}

datasource = new Datasource<MyItem>({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i < index + count; i++) {
      const found = this.data.find(item => item.id === i);
      if (found) {
        data.push(found);
      }
    }
    success(data);
  },
  settings: {
    startIndex: this.MIN
  }
});

async doAppend() {
  await this.datasource.adapter.relax();
  const items = [];
  for (let i = 0; i < this.inputValue; i++) {
    this.MAX++;
    const newItem: MyItem = {
      id: this.MAX,
      text: 'item #' + this.MAX + '*'
    };
    this.data.push(newItem);
    items.push(newItem);
  }
  this.datasource.adapter.append({ items, eof: true });
}

async doPrepend() {
  await this.datasource.adapter.relax();
  const items = [];
  for (let i = 0; i < this.inputValue; i++) {
    this.MIN--;
    const newItem: MyItem = {
      id: this.MIN,
      text: 'item #' + this.MIN + '*'
    };
    this.data.unshift(newItem);
    items.push(newItem);
  }
  this.datasource.adapter.prepend({ items, bof: true });
}`
  }, {
    name: DemoSourceType.Component + ' 2',
    text: `MIN = 100;
MAX = 200;
inputValue = 1;
data: MyItem2[];

constructor() {
  this.data = [];
  for (let i = this.MIN; i <= this.MAX; i++) {
    this.data.push({ text: 'item #' + i });
  }
}

datasource = new Datasource<MyItem2>({
  get: (index, count, success) => {
    const data: MyItem2[] = [];
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
    startIndex: this.MIN
  }
});

async doAppend() {
  await this.datasource.adapter.relax();
  const items = [];
  for (let i = 0; i < this.inputValue; i++) {
    this.MAX++;
    const newItem: MyItem2 = {
      text: 'item #' + this.MAX + '*'
    };
    this.data.push(newItem);
    items.push(newItem);
  }
  this.datasource.adapter.append({ items, eof: true });
}

async doPrepend() {
  await this.datasource.adapter.relax();
  const items = [];
  for (let i = 0; i < this.inputValue; i++) {
    this.MIN--;
    const newItem: MyItem2 = {
      text: 'item #' + this.MIN + '*'
    };
    this.data.unshift(newItem);
    items.push(newItem);
  }
  this.datasource.adapter.prepend({ items, bof: true });
}`
  }, {
    active: true,
    name: DemoSourceType.Template,
    text: `<button (click)="doAppend()">Append</button> /
<button (click)="doPrepend()">Prepend</button>
<input [(ngModel)]="inputValue" size="2">

<div class="viewport">
  <div *uiScroll="let item of datasource">
    <div class="item">{{item.text}}</div>
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
}`
  }];

  prependCallSample = 'Adapter.prepend({ items, bof })';
  appendCallSample = 'Adapter.append({ items, eof })';

  inputValue = 1;

  onInputChanged(target: HTMLInputElement) {
    const value = parseInt(target.value.trim(), 10);
    target.value = value.toString();
    this.inputValue = value;
  }

  async doPrepend() {
    await this.datasource.adapter.relax();
    const items = [];
    for (let i = 0; i < this.inputValue; i++) {
      this.MIN--;
      const newItem = {
        id: this.MIN,
        text: 'item #' + this.MIN + '*'
      };
      this.data.unshift(newItem);
      items.push(newItem);
    }
    this.datasource.adapter.prepend({ items, bof: true });
  }

  async doAppend() {
    await this.datasource.adapter.relax();
    const items = [];
    for (let i = 0; i < this.inputValue; i++) {
      this.MAX++;
      const newItem = {
        id: this.MAX,
        text: 'item #' + this.MAX + '*'
      };
      this.data.push(newItem);
      items.push(newItem);
    }
    this.datasource.adapter.append({ items, eof: true });
  }

  async doPrependIndex() {
    await this.datasourceIndex.adapter.relax();
    const items = [];
    for (let i = 0; i < this.inputValue; i++) {
      this.MIN--;
      const newItem: MyItem = { id: 'x', text: 'item #' + this.MIN + '*' };
      this.data.unshift(newItem);
      items.push(newItem);
    }
    this.datasourceIndex.adapter.prepend({ items, bof: true });
  }

  async doAppendIndex() {
    await this.datasourceIndex.adapter.relax();
    const items = [];
    for (let i = 0; i < this.inputValue; i++) {
      this.MAX++;
      const newItem: MyItem = { id: 'x', text: 'item #' + this.MAX + '*' };
      this.data.push(newItem);
      items.push(newItem);
    }
    this.datasourceIndex.adapter.append({ items, eof: true });
  }

}
