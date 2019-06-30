import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-append-prepend',
  templateUrl: './append-prepend.component.html'
})
export class DemoAppendPrependComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'adapter',
    title: `Append / prepend`,
    titleId: `append-prepend`,
    viewportId: `append-prepend-viewport`,
    count: 0,
    log: ''
  };

  data: Array<any>;
  inputValue = 4;
  newIndex = 0;

  datasource = new Datasource({
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
    text: `data: Array<any>;
inputValue = 4;
newIndex = 0;

datasource = new Datasource({
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
    const items: any[] = [];
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

doPrepend() {
  this.datasource.adapter.prepend(this.generateItems(true));
}

doAppend() {
  this.datasource.adapter.append(this.generateItems(false));
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
  overflow-anchor: none;
}
.item {
  font-weight: bold;
  height: 25px;
}`
  }];

  onInputChanged(target: HTMLInputElement) {
    const value = parseInt(target.value.trim(), 10);
    target.value = value.toString();
    this.inputValue = value;
  }

  generateItems(isPrepend: boolean) {
    const items: any[] = [];
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

  doPrepend() {
    this.datasource.adapter.prepend(this.generateItems(true));
  }

  doAppend() {
    this.datasource.adapter.append(this.generateItems(false));
  }

}
