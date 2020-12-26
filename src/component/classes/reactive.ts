interface Subscription<T> {
  on: (value: T) => void;
  off: () => void;
}

interface Options {
  immediate?: boolean; // if true, emit right on subscribe
  equal?: boolean; // if true, emit when new value is equal to the old one
}

export class Reactive<T> {

  private value: T;
  private id: number;
  private options: Options;
  private subscriptions: Map<number, Subscription<T>>;

  constructor(value?: T, options?: Options) {
    this.id = 0;
    if (value !== void 0) {
      this.value = value;
    }
    this.options = options || {};
    this.subscriptions = new Map();
  }

  set(value: T) {
    if (this.value === value && !this.options.equal) {
      return;
    }
    this.value = value;
    this.subscriptions.forEach(sub => sub.on(value));
  }

  get(): T {
    return this.value;
  }

  on(callback: (value: T) => void): () => void {
    const id = this.id++;
    const subscription: Subscription<T> = {
      on: callback,
      off: () => {
        subscription.on = () => null;
        this.subscriptions.delete(id);
      }
    };
    this.subscriptions.set(id, subscription);
    if (this.options.immediate) {
      subscription.on(this.value);
    }
    return () => subscription.off();
  }

  dispose() {
    this.subscriptions.forEach(sub => sub.off());
  }
}
