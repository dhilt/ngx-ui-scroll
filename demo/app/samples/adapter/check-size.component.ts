import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { DemoContext, DemoSources, DemoSourceType } from '../../shared/interfaces';
import { doLog } from '../../shared/datasource-get';

import { Datasource } from '../../../../public_api';

@Component({
  selector: 'app-demo-check-size',
  templateUrl: './check-size.component.html'
})
export class DemoCheckSizeComponent {

  demoContext: DemoContext = <DemoContext> {
    scope: 'adapter',
    title: `Check size`,
    titleId: `check-size`,
    viewportId: `check-size-viewport`,
    count: 0,
    log: ''
  };

  MIN = 1;
  MAX = 200;
  startIndex = 20;
  sizeValue = 15;
  data: Array<any>;
  needAutoscroll: false;

  constructor() {
    this.data = [];
    for (let i = this.MIN; i <= this.MAX; i++) {
      this.data.push({ id: i, text: 'item #' + i, height: 50 });
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
      startIndex: this.startIndex
    }
  });

  sources: DemoSources = [{
    name: DemoSourceType.Component,
    text: `MIN = 1;
MAX = 200;
startIndex = 20;
sizeValue = 15;
data: Array<any>;
needAutoscroll: false;

constructor() {
  this.data = [];
  for (let i = this.MIN; i <= this.MAX; i++) {
    this.data.push({ id: i, text: 'item #' + i, height: 50 });
  }
}

datasource = new Datasource ({
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
    startIndex: this.startIndex
  }
});

findElement(index: number) {
  const viewportElement = document.getElementById(this.demoContext.viewportId);
  return viewportElement
    ? viewportElement.querySelector(\`[data-sid="\${index}"]\`)
    : null;
}

doChangeSize() {
  const index = Number(this.startIndex - 5);
  if (!isNaN(index)) {
    for (let i = index; i < index + 10; i++) {
      const element = this.findElement(i);
      if (element) {
        (<HTMLElement>element).style.height = this.sizeValue + 'px';
        const item = this.data.find(_item => _item.id === i);
        if (item) {
          item.height = this.sizeValue;
        }
      }
    }
  }
}

autoscroll(index: number) {
  const { adapter } = this.datasource;
  let isLoadingSubscription: Subscription;
  const done = () => isLoadingSubscription && isLoadingSubscription.unsubscribe();
  isLoadingSubscription = adapter.isLoading$.subscribe(isLoading => {
    if (isLoading) {
      return;
    }
    const element = this.findElement(index);
    const viewportElement = document.getElementById(this.demoContext.viewportId);
    if (!element || !viewportElement) {
      done();
      return;
    }
    const elementTop = element.getBoundingClientRect().top;
    const viewportTop = viewportElement.getBoundingClientRect().top;
    const toScroll = viewportTop - elementTop;
    const diff = viewportElement.scrollTop - toScroll;
    if (viewportElement.scrollTop === diff) {
      done();
    } else {
      adapter.setScrollPosition(diff);
      if (viewportElement.scrollTop === diff) {
        done();
      }
    }
  });
}

doCheck() {
  let firstVisibleIndex;
  if (this.needAutoscroll) {
    firstVisibleIndex = this.datasource.adapter.firstVisible.$index;
  }
  this.doChangeSize();
  this.datasource.adapter.check();
  if (firstVisibleIndex !== undefined) {
    this.autoscroll(firstVisibleIndex);
  }
}`
  }, {
    active: true,
    name: DemoSourceType.Template,
    text: `<button (click)="doCheck(20)">Resize and Check</button>
<br />
Autoscroll: <input type="checkbox" [(ngModel)]="needAutoscroll"/>
<br />
First visible item's index: {{datasource.adapter.firstVisible.$index}}

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
  overflow-y: hidden;
}`
  }];

  findElement(index: number) {
    const viewportElement = document.getElementById(this.demoContext.viewportId);
    return viewportElement
      ? viewportElement.querySelector(`[data-sid="${index}"]`)
      : null;
  }

  doChangeSize() {
    const index = Number(this.startIndex - 5);
    if (!isNaN(index)) {
      for (let i = index; i < index + 10; i++) {
        const element = this.findElement(i);
        if (element) {
          (<HTMLElement>element).style.height = this.sizeValue + 'px';
          const item = this.data.find(_item => _item.id === i);
          if (item) {
            item.height = this.sizeValue;
          }
        }
      }
    }
  }

  autoscroll(index: number) {
    const { adapter } = this.datasource;
    let isLoadingSubscription: Subscription;
    const done = () => isLoadingSubscription && isLoadingSubscription.unsubscribe();
    isLoadingSubscription = adapter.isLoading$.subscribe(isLoading => {
      if (isLoading) {
        return;
      }
      const element = this.findElement(index);
      const viewportElement = document.getElementById(this.demoContext.viewportId);
      if (!element || !viewportElement) {
        done();
        return;
      }
      const elementTop = element.getBoundingClientRect().top;
      const viewportTop = viewportElement.getBoundingClientRect().top;
      const toScroll = viewportTop - elementTop;
      const diff = viewportElement.scrollTop - toScroll;
      if (viewportElement.scrollTop === diff) {
        done();
      } else {
        adapter.setScrollPosition(diff);
        if (viewportElement.scrollTop === diff) {
          done();
        }
      }
    });
  }

  doCheck() {
    let firstVisibleIndex;
    if (this.needAutoscroll) {
      firstVisibleIndex = this.datasource.adapter.firstVisible.$index;
    }
    this.doChangeSize();
    this.datasource.adapter.check();
    if (firstVisibleIndex !== undefined) {
      this.autoscroll(firstVisibleIndex);
    }
  }

}
