import { Component } from '@angular/core';
import { BehaviorSubject, Subject, merge, Subscription } from 'rxjs';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api'; // from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-insert',
  templateUrl: './insert.component.html'
})
export class DemoInsertComponent {

  demoContext: DemoContext = <DemoContext>{
    scope: 'adapter',
    title: `Insert`,
    titleId: `insert`,
    viewportId: `insert-viewport`,
    count: 0,
    log: ''
  };

  MIN = 1;
  MAX = 100;
  data: Array<any>;

  constructor() {
    this.data = [];
    for (let i = this.MIN; i <= this.MAX; i++) {
      this.data.push({ id: i, text: 'item #' + i });
    }
  }

  datasource = new Datasource({
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
    },
    devSettings: {
      debug: true
    }
  });

  inputCount = '2';
  inputIndex = '3';

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: ``
  }, {
    active: true,
    name: DemoSourceType.Template,
    text: ``
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

  doInsert() {
    const index = Number(this.inputIndex);
    const count = Number(this.inputCount);
    if (isNaN(index) || isNaN(count)) {
      return;
    }
    const items = [];
    for (let i = 1; i <= count; i++) {
      this.MAX++;
      const newItem = {
        id: this.MAX,
        text: 'item #' + index + ' ' + Array(i).fill('*').join('')
      };
      items.push(newItem);
    }
    this.data = [
      ...this.data.slice(0, index),
      ...items,
      ...this.data.slice(index).map(item => ({ ...item, id: item.id + index }))
    ];
    this.datasource.adapter.insert({
      after: ({ $index, data }) => $index === index,
      items
    });
  }
}
