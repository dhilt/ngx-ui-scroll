import { Direction } from '../interfaces/direction';
import { Routines } from './domRoutines';
import { Settings } from './settings';
import { Buffer } from './buffer';

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
  buffer: Buffer;
  forward: Padding;
  backward: Padding;

  constructor(element: HTMLElement, routines: Routines, settings: Settings, buffer: Buffer) {
    this.settings = settings;
    this.buffer = buffer;
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
    const { settings, buffer } = this;
    let positiveSize = viewportSize;
    let max = -Infinity;
    if (buffer.cache.enabled && buffer.maxIndex !== startIndex) {
      max = buffer.maxIndex;
    }
    if (isFinite(settings.maxIndex) && settings.maxIndex > max) {
      max = settings.maxIndex;
    }
    let size = settings.itemSize;
    if (buffer.cache.enabled) {
      size = buffer.averageSize;
    }
    if (isFinite(max)) {
      positiveSize = (max - startIndex + 1) * size;
    }
    return positiveSize;
  }

  getNegativeSize(startIndex: number) {
    const { settings, buffer } = this;
    let negativeSize = 0;
    let min = +Infinity;
    if (buffer.cache.enabled && buffer.minIndex !== startIndex) {
      min = buffer.minIndex;
    }
    if (isFinite(settings.minIndex) && settings.minIndex < min) {
      min = settings.minIndex;
    }
    let size = settings.itemSize;
    if (buffer.cache.enabled) {
      size = buffer.averageSize;
    }
    if (isFinite(min)) {
      negativeSize = (startIndex - min) * size;
    }
    return negativeSize;
  }
}
