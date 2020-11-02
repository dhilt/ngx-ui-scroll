import { Component } from '@angular/core';

import { DemoContext, DemoSources } from '../../shared/interfaces';
import { Datasource } from '../../../../public_api';

@Component({
  selector: 'app-adapter-relax',
  templateUrl: './adapter-relax.component.html'
})
export class DemoAdapterRelaxComponent {

  demoContext = {
    scope: 'adapter',
    title: `Adapter relax`,
    titleId: `relax`,
    noInfo: true
  } as DemoContext;

  datasource = new Datasource({
    get: (index: number, count: number, success: Function) => {
      const data = [];
      for (let i = index; i < index + count; i++) {
        data.push({ id: i, text: 'item #' + i });
      }
      success(data);
    }
  });

  sources: DemoSources = [{
    active: true,
    name: 'Relax',
    text: `async doReplace() {
  const { adapter } = this.datasource;
  await adapter.relax();
  adapter.remove(({ $index }) =>
    $index > 4 && $index < 8
  );
  await adapter.relax();
  adapter.insert({
    items: [{ id: '5*', text: 'item #5 *' }],
    after: ({ $index }) => $index === 4 }
  );
}
`
}, {
    name: 'Is loading',
    text: `relax(cb: Function) {
  const { adapter } = this.datasource;
  if (!adapter.isLoading) {
    cb();
  } else {
    adapter.isLoading$
      .pipe(filter(isLoading => !isLoading), take(1))
      .subscribe(() => cb());
  }
}

doReplace() {
  const { adapter } = this.datasource;
  this.relax(() =>
    adapter.remove(({ $index }) =>
      $index > 4 && $index < 8
    )
  );
  this.relax(() =>
    adapter.insert({
      items: [{ id: '5*', text: 'item #5 *' }],
      after: ({ $index }) => $index === 4
    })
  );
}
`
}, {
    name: 'Callback',
    text: `doReplace() {
  const { adapter } = this.datasource;
  adapter.relax(() =>
    adapter.remove(({ $index }) =>
      $index > 4 && $index < 8
    )
  );
  adapter.relax(() =>
    adapter.insert({
      items: [{ id: '5*', text: 'item #5 *' }],
      after: ({ $index }) => $index === 4
    })
  );
}
`
}, {
    name: 'Return',
    text: `async doReplace() {
  const { adapter } = this.datasource;
  await adapter.relax();
  await adapter.remove(({ $index }) =>
    $index > 4 && $index < 8
  );
  adapter.insert({
    items: [{ id: '5*', text: 'item #5 *' }],
    after: ({ $index }) => $index === 4
  });
}
`
}];

  isLoadingSample = `
  if (!adapter.isLoading) {
    doSomething();
  } else {
    adapter.isLoading$
      .pipe(filter(isLoading => !isLoading), take(1))
      .subscribe(() => doSomething());
  }`;

  relaxSample = `
  await adapter.relax();
  doSomething();`;

  async doReplace() {
    const { adapter } = this.datasource;
    const newItem = { id: '5*', text: 'item #5 *' };
    await adapter.relax();
    adapter.remove(({ $index }) => $index > 4 && $index < 8);
    await adapter.relax();
    adapter.insert({ items: [newItem], after: ({ $index }) => $index === 4 });
  }

}
