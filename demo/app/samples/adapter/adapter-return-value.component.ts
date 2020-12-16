import { Component } from '@angular/core';

import { demos } from '../../routes';

@Component({
  selector: 'app-demo-adapter-return-value',
  templateUrl: './adapter-return-value.component.html'
})
export class DemoAdapterReturnValueComponent {

  demoConfig = demos.adapter.map.returnValue;

  returnValueType = `  Promise<{
    success: boolean,
    immediate: boolean,
    details: string | null
  }>`;

  returnValueSample = `
  const { immediate } = await adapter.remove({ predicate });
  if (immediate) {
    console.log('No items were removed');
  }`;

  explicitSequenceSample = `
  await adapter.append({ items });
  scrollToBottom(); // will not scroll without "await"
  `;
}
