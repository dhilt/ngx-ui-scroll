/*
This code is taken from Mitt event emitter v2.1.0
https://github.com/developit/mitt
Removed wildcard functionality
*/

export type EventType = string | symbol;
export type Handler<T = any> = (event?: T) => void;
export type WildcardHandler = (type: EventType, event?: any) => void;
export type EventHandlerList = Array<Handler>;
export type EventHandlerMap = Map<EventType, EventHandlerList>;

export interface Emitter {
  all: EventHandlerMap;
  on<T = any>(type: EventType, handler: Handler<T>): void;
  off<T = any>(type: EventType, handler: Handler<T>): void;
  emit<T = any>(type: EventType, event?: T): void;
}

export default function mitt(all: EventHandlerMap = new Map()): Emitter {
  return {
    all,
    on<T = any>(type: EventType, handler: Handler<T>) {
      const handlers = all.get(type);
      const added = handlers && handlers.push(handler);
      if (!added) {
        all.set(type, [handler]);
      }
    },
    off<T = any>(type: EventType, handler: Handler<T>) {
      const handlers = all.get(type);
      if (handlers) {
        // tslint:disable-next-line:no-bitwise
        handlers.splice(handlers.indexOf(handler) >>> 0, 1);
      }
    },
    emit<T = any>(type: EventType, evt: T) {
      ((all.get(type) || []) as EventHandlerList).slice().map((handler) => { handler(evt); });
    }
  };
}

export const EVENTS = {
  WORKFLOW: {
    DISPOSE: 'workflow.dispose',
  },
};
