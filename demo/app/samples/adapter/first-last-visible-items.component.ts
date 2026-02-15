import { Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { demos } from '../../routes';
import {
  DemoContext,
  DemoSources,
  DemoSourceType
} from '../../shared/interfaces';
import { datasourceGetCallbackInfinite } from '../../shared/datasource-get';
import { IAdapterItem } from '../../../../scroller/src/vscroll';

import { Datasource } from 'ngx-ui-scroll';

@Component({
  selector: 'app-demo-first-last-visible-items',
  templateUrl: './first-last-visible-items.component.html',
  standalone: false
})
export class DemoFirstLastVisibleItemsComponent {
  demoContext: DemoContext = {
    config: demos.adapterProps.map.firstLastVisible,
    viewportId: 'first-last-visible-items-viewport',
    count: 0,
    log: signal('')
  };

  datasource = new Datasource({
    get: datasourceGetCallbackInfinite(this.demoContext)
  });

  init = signal(false);

  visibleCount = toSignal(
    combineLatest([
      this.datasource.adapter
        .firstVisible$ as unknown as Observable<IAdapterItem>,
      this.datasource.adapter
        .lastVisible$ as unknown as Observable<IAdapterItem>
    ]).pipe(
      map(([first, last]) => {
        const f = Number(first.$index);
        const l = Number(last.$index);
        return !isNaN(f) && !isNaN(l) ? l - f + 1 : 0;
      })
    ),
    { initialValue: 0 }
  );

  constructor() {
    setTimeout(() => this.init.set(true));
  }

  sources: DemoSources = [
    {
      name: DemoSourceType.Component,
      text: `datasource = new Datasource ({
  get: (index, count, success) => {
    const data = [];
    for (let i = index; i <= index + count - 1; i++) {
      data.push({ id: i, text: 'item #' + i });
    }
    success(data);
  }
});

constructor() {
  const { firstVisible$, lastVisible$ } = this.datasource.adapter;
  combineLatest(firstVisible$, lastVisible$)
    .subscribe(result => {
      const first = Number(result[0].$index);
      const last = Number(result[1].$index);
      this.visibleCount =
        isNaN(first) || isNaN(last) ? 0 : last - first + 1;
    });
}`
    },
    {
      active: true,
      name: DemoSourceType.Template,
      text: `First visible item's index:
{{datasource.adapter.firstVisible.$index}}
<br>
Last visible item's index:
{{(datasource.adapter.lastVisible$ | async)?.$index}}
<br>
Visible items counter: {{visibleCount}}

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
}`
    }
  ];

  itemAdapterDescription = `  ItemAdapter {
    $index: number;
    data: any;
    element?: HTMLElement;
  }`;
}
