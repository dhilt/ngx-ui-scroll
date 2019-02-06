import {
  Direction,
  ScrollEventData as IScrollEventData,
  ScrollState as IScrollState,
  SyntheticScroll as ISyntheticScroll,
  WindowScrollState as IWindowScrollState
} from '../interfaces/index';

class WindowScrollState implements IWindowScrollState {
  positionToUpdate: number;
  delta: number;

  constructor() {
    this.reset();
  }

  reset() {
    this.delta = 0;
    this.positionToUpdate = 0;
  }
}

export class ScrollState implements IScrollState {
  firstScroll: boolean;
  firstScrollTime: number;
  lastScrollTime: number;
  scrollTimer: number | null;
  workflowTimer: number | null;
  scroll: boolean;
  keepScroll: boolean;
  window: IWindowScrollState;

  position: number;
  time: number;
  direction: Direction;
  positionBefore: number;

  constructor() {
    this.window = new WindowScrollState();
    this.reset();
  }

  reset() {
    this.firstScroll = false;
    this.firstScrollTime = 0;
    this.lastScrollTime = 0;
    this.scrollTimer = null;
    this.workflowTimer = null;
    this.scroll = false;
    this.keepScroll = false;
    this.position = 0;
    this.time = Number(new Date());
    this.direction = Direction.forward;
    this.window.reset();
  }

  getData(): IScrollEventData {
    return new ScrollEventData(this.position, this.positionBefore, this.time, this.direction);
  }

  setData({ position, time, direction }: IScrollEventData) {
    this.position = position;
    this.time = time;
    this.direction = direction;
  }
}

class ScrollEventData implements IScrollEventData {
  time: number;
  position: number;
  direction: Direction;
  positionBefore: number | null;
  handled: boolean;

  constructor(position: number, positionBefore: number | null, time?: number, direction?: Direction) {
    this.time = time || Number(new Date());
    this.position = position;
    this.positionBefore = positionBefore;
    this.direction = direction || Direction.forward;
    this.handled = false;
  }
}

export class SyntheticScroll implements ISyntheticScroll {
  before: IScrollEventData | null;
  list: Array<IScrollEventData>;

  get isSet(): boolean {
    return !!this.list.length;
  }

  get isDone(): boolean {
    return this.list.some(i => i.handled);
  }

  get position(): number | null {
    return this.getLast('position');
  }

  get time(): number | null {
    return this.getLast('time');
  }

  get direction(): Direction | null {
    return this.getLast('direction');
  }

  get handledPosition(): number | null {
    const found = this.getHandled();
    return found ? found.position : null;
  }

  get handledTime(): number | null {
    const found = this.getHandled();
    return found ? found.time : null;
  }

  get registeredTime(): number | null {
    return this.before ? this.before.time : null;
  }

  get registeredPosition(): number | null {
    return this.before ? this.before.position : null;
  }

  constructor() {
    this.reset();
  }

  private getHandled(): IScrollEventData | null {
    return this.list.find(i => i.handled) || null;
  }

  private getLast(token: string): any {
    const { length } = this.list;
    if (!length) {
      return null;
    }
    const last = this.list[length - 1];
    switch (token) {
      case 'position':
        return last.position;
      case 'time':
        return last.time;
      case 'direction':
        return last.direction;
      default:
        return null;
    }
  }

  reset() {
    this.before = null;
    this.list = [];
  }

  register({ position, time, direction }: IScrollEventData) {
    this.before = new ScrollEventData(position, null, time, direction);
  }

  push(position: number, positionBefore: number, regData: IScrollEventData) {
    const evtData = new ScrollEventData(position, positionBefore);
    if (this.registeredTime !== regData.time) {
      this.reset();
      this.register(regData);
    }
    this.list.push(evtData);
  }

  done() {
    const handled = this.getHandled();
    if (handled) { // equivalent to if (this.isDone)
      this.register(handled);
      this.list = this.list.filter(i => i.time > handled.time);
    }
    const last = this.list.length ? this.list[this.list.length - 1] : null;
    if (last) {
      last.handled = true;
    } else {
      this.reset();
    }
  }

  nearest(position: number): IScrollEventData | null {
    const last = this.before;
    if (!last) {
      return null;
    }
    const inc = last.direction === Direction.forward ? -1 : 1;
    const nearest = this.list.reduce(
      (acc: IScrollEventData | null, item: IScrollEventData) => {
        const delta = inc * (position - item.position);
        if (!acc) {
          return delta < 0 ? item : null;
        }
        const accDelta = position - acc.position;
        if (delta < 0 && delta > accDelta) {
          return item;
        }
        return acc;
      }
      , null);
    if (!nearest) {
      return last;
    }
    const synthDelta = inc * (position - nearest.position);
    const beforeDelta = inc * (position - last.position);
    if (beforeDelta < 0 && beforeDelta > synthDelta) {
      return last;
    }
    if (synthDelta < 0) {
      return nearest;
    }
    return null;
  }
}
