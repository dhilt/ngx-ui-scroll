import { ElementRef } from '@angular/core';
import { Padding } from './padding';
import { Direction } from '../interfaces/direction';
import { Settings } from './settings';

export class ViewportPadding {
  forward: Padding;
  backward: Padding;

  constructor(element) {
    this.forward = new Padding(element, Direction.forward);
    this.backward = new Padding(element, Direction.backward);
  }
}

export class Viewport {

  private settings: Settings;
  private host = null;
  scrollable = null;
  padding: ViewportPadding;

  private lastPosition: number;

  constructor(elementRef: ElementRef, settings: Settings) {
    this.settings = settings;
    this.host = elementRef.nativeElement;
    this.scrollable = elementRef.nativeElement.parentElement;
    this.padding = new ViewportPadding(this.host);
  }

  get children(): HTMLCollection {
    return this.host.children;
  }

  get scrollPosition(): number {
    return this.scrollable.scrollTop;
  }

  set scrollPosition(value: number) {
    this.scrollable.scrollTop = value;
  }

  saveScrollPosition() {
    this.lastPosition = this.scrollPosition;
  }

  getLastPosition(): number {
    return this.lastPosition;
  }

  getSize(): number {
    return this.scrollable.getBoundingClientRect().height;
  }

  getBufferPadding(): number {
    return this.getSize() * this.settings.padding;
  }

  getEdge(direction: Direction, opposite?: boolean): number {
    const params = this.scrollable.getBoundingClientRect();
    return params[direction === (!opposite ? Direction.forward : Direction.backward) ? 'bottom' : 'top'];
  }

  getLimit(direction: Direction): number {
    return this.getEdge(direction, true) + (direction === Direction.forward ? -1 : 1) * this.getBufferPadding();
  }

  static getItemEdge(element, direction: Direction, opposite?: boolean): number {
    const params = element.getBoundingClientRect();
    return params[direction === (!opposite ? Direction.forward : Direction.backward) ? 'bottom' : 'top'];
  }

  static hideItem(element) {
    element.style.display = 'none';
  }

}
