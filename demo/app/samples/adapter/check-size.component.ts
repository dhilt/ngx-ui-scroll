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
  selector: 'app-demo-check-size',
  templateUrl: './check-size.component.html'
})
export class DemoCheckSizeComponent {
  demoContext: DemoContext = {
    config: demos.adapterMethods.map.check,
    viewportId: 'check-size-viewport',
    count: 0,
    log: ''
  };

  MIN = 1;
  MAX = 200;
  startIndex = 20;
  sizeValue = 15;
  data: MyItem[];
  needAutoscroll = false;

  constructor() {
    this.data = [];
    for (let i = this.MIN; i <= this.MAX; i++) {
      this.data.push({ id: i, text: 'item #' + i, size: 50 });
    }
  }

  datasource = new Datasource<MyItem>({
    get: (index, count, success) => {
      const data: MyItem[] = [];
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

  sources: DemoSources = [
    {
      name: DemoSourceType.Component,
      text: `MIN = 1;
MAX = 200;
startIndex = 20;
sizeValue = 15;
data: MyItem[];
needAutoscroll: false;

constructor() {
  this.data = [];
  for (let i = this.MIN; i <= this.MAX; i++) {
    this.data.push({ id: i, text: 'item #' + i, size: 50 });
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
    startIndex: this.startIndex
  }
});

findElement(index: number): HTMLElement | null {
  const viewportElement = document.getElementsByClassName('viewport')[0];
  return viewportElement
    ? viewportElement.querySelector(\`[data-sid="\${index}"]\`)
    : null;
}

doChangeSize() {
  const DELTA = 5;
  const index = Number(this.startIndex - DELTA);
  if (!isNaN(index)) {
    for (let i = index; i < index + DELTA * 2; i++) {
      const element = this.findElement(i);
      if (element) {
        element.style.height = this.sizeValue + 'px';
        const item = this.data.find(({ id }) => id === i);
        if (item) {
          item.size = this.sizeValue;
        }
      }
    }
  }
}

autoscroll(index: number) {
  const element = this.findElement(index);
  const viewportElement = document.getElementsByClassName('viewport')[0];
  if (!element || !viewportElement) {
    return;
  }
  const elementTop = element.getBoundingClientRect().top;
  const viewportTop = viewportElement.getBoundingClientRect().top;
  const toScroll = viewportTop - elementTop;
  const diff = viewportElement.scrollTop - toScroll;
  if (viewportElement.scrollTop === diff) {
    return;
  }
  this.datasource.adapter.fix({ scrollPosition: diff });
}

async doCheck() {
  await this.datasource.adapter.relax();
  let firstVisibleIndex: number | undefined;
  if (this.needAutoscroll) {
    firstVisibleIndex = this.datasource.adapter.firstVisible.$index;
  }
  this.doChangeSize();
  await this.datasource.adapter.check();
  if (firstVisibleIndex !== undefined) {
    this.autoscroll(firstVisibleIndex);
  }
}`
    },
    {
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
  overflow: hidden;
}`
    }
  ];

  findElement(index: number): HTMLElement | null {
    const viewportId =
      this.demoContext.viewportId || this.demoContext.config.id;
    const viewportElement = document.getElementById(viewportId);
    return viewportElement
      ? viewportElement.querySelector(`[data-sid="${index}"]`)
      : null;
  }

  doChangeSize() {
    const DELTA = 5;
    const index = Number(this.startIndex - DELTA);
    if (!isNaN(index)) {
      for (let i = index; i < index + DELTA * 2; i++) {
        const element = this.findElement(i);
        if (element) {
          element.style.height = this.sizeValue + 'px';
          const item = this.data.find(({ id }) => id === i);
          if (item) {
            item.size = this.sizeValue;
          }
        }
      }
    }
  }

  autoscroll(index: number) {
    const element = this.findElement(index);
    const viewportId =
      this.demoContext.viewportId || this.demoContext.config.id;
    const viewportElement = document.getElementById(viewportId);
    if (!element || !viewportElement) {
      return;
    }
    const elementTop = element.getBoundingClientRect().top;
    const viewportTop = viewportElement.getBoundingClientRect().top;
    const toScroll = viewportTop - elementTop;
    const diff = viewportElement.scrollTop - toScroll;
    if (viewportElement.scrollTop === diff) {
      return;
    }
    this.datasource.adapter.fix({ scrollPosition: diff });
  }

  async doCheck() {
    await this.datasource.adapter.relax();
    let firstVisibleIndex: number | undefined;
    if (this.needAutoscroll) {
      firstVisibleIndex = this.datasource.adapter.firstVisible.$index;
    }
    this.doChangeSize();
    await this.datasource.adapter.check();
    if (firstVisibleIndex !== void 0) {
      this.autoscroll(firstVisibleIndex);
    }
  }
}
