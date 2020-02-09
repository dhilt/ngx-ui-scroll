import { Direction } from '../interfaces/direction';
import { Routines } from './domRoutines';
import { Settings } from './settings';

export class Padding {

  element: HTMLElement;
  direction: Direction;
  routines: Routines;

  constructor(element: HTMLElement, direction: Direction, routines: Routines) {
    this.element = <HTMLElement>element.querySelector(`[data-padding-${direction}]`);
    this.direction = direction;
    this.routines = routines;
  }

  reset(size?: number) {
    this.size = size || 0;
  }

  get size(): number {
    return this.routines.getSizeStyle(this.element);
  }

  set size(value: number) {
    this.routines.setSizeStyle(this.element, Math.round(value));
  }

}

export class Paddings {
  settings: Settings;
  forward: Padding;
  backward: Padding;

  constructor(element: HTMLElement, routines: Routines, settings: Settings) {
    this.settings = settings;
    this.forward = new Padding(element, Direction.forward, routines);
    this.backward = new Padding(element, Direction.backward, routines);
  }

  reset(viewportSize: number, startIndex: number) {
    const positive = this.getPositiveSize(startIndex, viewportSize);
    const negative = this.getNegativeSize(startIndex);
    if (this.settings.inverse) {
      this.forward.reset(negative);
      this.backward.reset(positive);
      const diff = viewportSize - this.backward.size;
      if (diff > 0) {
        this.backward.size += diff;
        this.forward.size -= diff;
      }
    } else {
      this.forward.reset(positive);
      this.backward.reset(negative);
      const diff = viewportSize - this.forward.size;
      if (diff > 0) {
        this.backward.size -= diff;
        this.forward.size += diff;
      }
    }

  }

  getPositiveSize(startIndex: number, viewportSize: number) {
    const { settings } = this;
    let positiveSize = viewportSize;
    if (isFinite(settings.maxIndex)) {
      positiveSize = (settings.maxIndex - startIndex + 1) * settings.itemSize;
    }
    return positiveSize;
  }

  getNegativeSize(startIndex: number) {
    const { settings } = this;
    let negativeSize = 0;
    if (isFinite(settings.minIndex)) {
      negativeSize = (startIndex - settings.minIndex) * settings.itemSize;
    }
    return negativeSize;
  }
}
