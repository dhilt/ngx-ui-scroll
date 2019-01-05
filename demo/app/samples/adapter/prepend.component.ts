import { Component } from '@angular/core';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-prepend',
  templateUrl: './prepend.component.html'
})
export class DemoPrependComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'adapter',
    title: `Prepend`,
    titleId: `prepend`,
    viewportId: `prepend-viewport`,
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
    doLog(this.demoContext, index, count, data.length);
    success(data);
  },
  settings: {
    startIndex: 100
  }
});

doPrepend() {
  const items = [];
  for (let i = 0; i < this.inputValue; i++) {
    this.newIndex++;
    items.push({
      id: this.newIndex,
      text: 'new item #' + this.newIndex + '*'
    });
  }
  this.datasource.adapter.prepend(items);
}`
  }, {
    name: DemoSourceType.Template,
    text: `<button (click)="doPrepend()">Prepend</button>
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

  doPrepend() {
    const items = [];
    for (let i = 0; i < this.inputValue; i++) {
      this.newIndex++;
      items.push({
        id: this.newIndex,
        text: 'new item #' + this.newIndex + '*'
      });
    }
    this.datasource.adapter.prepend(items);
  }

}
