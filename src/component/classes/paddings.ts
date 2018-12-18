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
    this.forward.reset(this.getPositiveSize(startIndex, viewportSize));
    this.backward.reset(this.getNegativeSize(startIndex));
    const fwdDiff = viewportSize - this.forward.size;
    if (fwdDiff > 0) {
      this.forward.size += fwdDiff;
      this.backward.size -= fwdDiff;
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
