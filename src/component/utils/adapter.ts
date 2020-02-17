import { BehaviorSubject, Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { Adapter as IAdapter, ItemAdapter } from '../interfaces/index';
import { IAdapterNew } from '../interfaces/adapter';

export const itemAdapterEmpty = <ItemAdapter>{
  data: {},
  element: {}
};

class AdapterContext {
  init$ = new BehaviorSubject<boolean>(false);

  // public scalar properties
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

    // public methods
    const publicMethods = [
      'reload', 'append', 'prepend', 'check', 'remove', 'clip', 'showLog', 'fix'
    ];
    publicMethods.forEach((token: string) => (<any>this)[token] = () => null);

    if (mock) {
      return;
    }

    // public observable properties
    const self = this;
    const publicObservableProperties = [
      'isLoading$', 'loopPending$', 'cyclePending$', 'firstVisible$', 'lastVisible$', 'bof$', 'eof$'
    ];
    publicObservableProperties.forEach((token: string) =>
      Object.defineProperty(this, token, {
        get: () =>
          this.init$.getValue()
            ? (<any>this)[`_${token}`]
            : this.init$.pipe(
                filter(init => !!init),
                switchMap(() => (<any>self)[`_${token}`])
              )
      })
    );
  }
}

export const generateAdapterContext = (mock: boolean): IAdapterNew => <any>(new AdapterContext(mock));

export const generateMockAdapter = (): IAdapter => (
  <IAdapter>{
    context: <any>{},
    init$: new BehaviorSubject<boolean>(false),
    version: '',
    init: false,
    isLoading: false,
    isLoading$: new Subject<boolean>(),
    loopPending: false,
    loopPending$: new Subject<boolean>(),
    cyclePending: false,
    cyclePending$: new Subject<boolean>(),
    firstVisible: itemAdapterEmpty,
    firstVisible$: new BehaviorSubject<ItemAdapter>(itemAdapterEmpty),
    lastVisible: itemAdapterEmpty,
    lastVisible$: new BehaviorSubject<ItemAdapter>(itemAdapterEmpty),
    itemsCount: 0,
    bof: false,
    bof$: new BehaviorSubject<boolean>(false),
    eof: false,
    eof$: new BehaviorSubject<boolean>(false),
    initialize: () => null,
    dispose: () => null,
    reload: () => null,
    append: () => null,
    prepend: () => null,
    check: () => null,
    remove: () => null,
    clip: () => null,
    showLog: () => null,
    fix: () => null // undocumented
  }
);

export const protectAdapterPublicMethod = (context: any, token: string) => {
  const func: any = context[token];
  if (typeof func !== 'function') {
    return;
  }
  context[token] = (...args: any) => {
    if (context.init) {
      context[token] = func;
      func.apply(context, args);
      return;
    }
    const sub = context.init$.subscribe((init: any) => {
      if (init) {
        context[token] = func;
        func.apply(context, args);
        sub.unsubscribe();
      }
    });
  };
};
