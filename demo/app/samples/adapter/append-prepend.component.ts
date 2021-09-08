import { Component } from '@angular/core';

import { demos } from '../../routes';
import { DemoContext, DemoSources, DemoSourceType, MyItem } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-append-prepend',
  templateUrl: './append-prepend.component.html'
})
export class DemoAppendPrependComponent {

  demoContext: DemoContext = {
    config: demos.adapterMethods.map.appendPrepend,
    viewportId: 'append-prepend-viewport',
    count: 0,
    log: ''
  };

  adapterScope = demos.adapter;
  adapterMethodsScope = demos.adapterMethods;

  data: MyItem[];
  inputValue = 4;
  newIndex = 0;

  datasource = new Datasource<MyItem>({
    get: (index, count, success) => {
      const data = [];
      for (let i = index; i < index + count; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      doLog(this.demoContext, index, count, data.length);
      success(data);
    },
    settings: {
      startIndex: 100
    }
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `data: MyItem[];
inputValue = 4;
newIndex = 0;

datasource = new Datasource<MyItem>({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i < index + count; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  },
  settings: {
    startIndex: 100
  }
});

generateItems(isPrepend: boolean) {
    const items: MyItem[] = [];
    for (let i = 0; i < this.inputValue; i++) {
      this.newIndex++;
      const item = {
        id: this.newIndex,
        text: 'new item #' + this.newIndex + '*'
      };
      isPrepend ? items.unshift(item) : items.push(item);
    }
    return items;
}

async doPrepend() {
  await this.datasource.adapter.relax();
  await this.datasource.adapter.prepend({
    items: this.generateItems(true)
  });
}

async doAppend() {
  await this.datasource.adapter.relax();
  await this.datasource.adapter.append({
    items: this.generateItems(false)
  });
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

  prependCallSample = 'Adapter.prepend({ items })';
  appendCallSample = 'Adapter.append({ items })';
  prependArgumentsDescription = `  AdapterPrependOptions {
    items: unknown[];
    bof?: boolean;
    increase?: boolean;
  }`;
  appendArgumentsDescription = `  AdapterAppendOptions {
    items: unknown[];
    eof?: boolean;
    decrease?: boolean;
  }`;

  onInputChanged(target: HTMLInputElement) {
    const value = parseInt(target.value.trim(), 10);
    target.value = value.toString();
    this.inputValue = value;
  }

  generateItems(isPrepend: boolean) {
    const items: MyItem[] = [];
    for (let i = 0; i < this.inputValue; i++) {
      this.newIndex++;
      const item = {
        id: this.newIndex,
        text: 'new item #' + this.newIndex + '*'
      };
      isPrepend ? items.unshift(item) : items.push(item);
    }
    return items;
  }

  async doPrepend() {
    await this.datasource.adapter.relax();
    await this.datasource.adapter.prepend({
      items: this.generateItems(true)
    });
  }

  async doAppend() {
    await this.datasource.adapter.relax();
    await this.datasource.adapter.append({
      items: this.generateItems(false)
    });
  }

}
