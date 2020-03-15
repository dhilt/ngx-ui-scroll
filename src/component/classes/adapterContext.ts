import { BehaviorSubject } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';

import { ADAPTER_PROPS, itemAdapterEmpty } from '../utils/index';
import { AdapterPropType } from '../interfaces/index';

let instanceCount = 0;

export class AdapterContext {
  init$ = new BehaviorSubject<boolean>(false);

  constructor(mock: boolean) {
    const id = ++instanceCount;
    Object.defineProperty(this, 'id', { get: () => id });

    // set defaults public adapter props
    ADAPTER_PROPS.filter( // except observables in non-mock case
      prop => mock || prop.type !== AdapterPropType.Observable
    ).forEach(({ name, value }) =>
      Object.defineProperty(this, name, {
        get: () => value,
        configurable: true
      })
    );
    if (mock) {
      return;
    }
    // set public observable props in non-mock case
    const self = this;
    ADAPTER_PROPS.filter(
      prop => prop.type === AdapterPropType.Observable
    ).forEach(({ name }) =>
      Object.defineProperty(this, name, {
        get: () =>
          this.init$.getValue()
            ? (<any>this)[`_${name}`]
            : this.init$.pipe(
                filter(init => !!init),
                switchMap(() => (<any>self)[`_${name}`])
              )
      })
    );
  }
}
