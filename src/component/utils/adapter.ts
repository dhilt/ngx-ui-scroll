import { BehaviorSubject, Subject } from 'rxjs';

import { Adapter as IAdapter, ItemAdapter } from '../interfaces/index';

export const itemAdapterEmpty = <ItemAdapter>{
  data: {},
  element: {}
};

export const generateMockAdapter = (): IAdapter => (
  <IAdapter>{
    context: <any>{},
    init$: new BehaviorSubject<boolean>(false),
    version: null,
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
    eof: false,
    initialize: () => null,
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
