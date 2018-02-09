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

  getScrollDirection(): Direction {
    const lastScrollPosition = this.getLastPosition();
    const scrollPosition = this.scrollPosition;
    if (lastScrollPosition < scrollPosition) {
      return Direction.forward;
    } else if (lastScrollPosition > scrollPosition) {
      return Direction.backward;
    }
    return;
  }

  getSize(): number {
    return this.scrollable.getBoundingClientRect().height;
  }

  getBufferPadding(): number {
    return this.getSize() * this.settings.padding;
  }

  getEdge(direction: Direction, opposite?: boolean): number {
    const params = this.scrollable.getBoundingClientRect();
    const result = params[direction === (!opposite ? Direction.forward : Direction.backward) ? 'bottom' : 'top'];
    // const result = this.scrollable.offsetTop +
    //   (direction === (!opposite ? Direction.forward : Direction.backward) ? this.getSize() : 0);
    return result;
  }

  getLimit(direction: Direction, opposite?: boolean): number {
    return this.getEdge(direction, opposite) +
      (direction === (!opposite ? Direction.forward : Direction.backward) ? 1 : -1) * this.getBufferPadding();
  }

  getItemSize(element): number {
    return element.getBoundingClientRect().height;
  }

  getItemEdge(element, direction: Direction, opposite?: boolean): number {
    const params = element.getBoundingClientRect();
    const result = params[direction === (!opposite ? Direction.forward : Direction.backward) ? 'bottom' : 'top'];
    // const result = element.offsetTop - this.scrollable.scrollTop +
    //   (direction === (!opposite ? Direction.forward : Direction.backward) ? this.getItemSize(element) : 0);
    return result;
  }

  hideItem(element) {
    element.style.display = 'none';
  }

}
