import { BehaviorSubject } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';

import { ADAPTER_PROPS, itemAdapterEmpty } from '../utils/index';
import { AdapterPropType } from '../interfaces/index';

export class AdapterContext {
  init$ = new BehaviorSubject<boolean>(false);

  // default public scalar properties
  version = '';
  isLoading = false;
  loopPending = false;
  cyclePending = false;
  firstVisible = itemAdapterEmpty;
  lastVisible = itemAdapterEmpty;
  itemsCount = 0;
  bof = false;
  eof = false;

  constructor(mock: boolean) {
    // null public methods
    ADAPTER_PROPS.filter(
      prop => prop.type === AdapterPropType.Function
    ).forEach(({ name }) => ((<any>this)[name] = () => null));

    if (mock) {
      return;
    }

    // public observable properties
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
