import { Component } from '@angular/core';

import { DemoContext } from '../../shared/interfaces';

@Component({
  selector: 'app-demo-adapter-return-value',
  templateUrl: './adapter-return-value.component.html'
})
export class DemoAdapterReturnValueComponent {
  demoContext = {
    scope: 'adapter',
    title: `Return value`,
    titleId: `return-value`,
    noWorkView: true
  } as DemoContext;

  returnValueType = `  Promise<{
    success: boolean,
    immediate: boolean,
    details: string | null
  }>`;

  returnValueSample = `
  const { immediate } = await adapter.remove(predicate);
  if (immediate) {
    console.log('No items were removed');
  }`;

  explicitSequenceSample = `
  await adapter.append({ items });
  scrollToBottom(); // will not scroll without "await"
  `;
}
