import { ElementRef } from '@angular/core';
import { Padding } from './padding';
import { Direction } from '../interfaces/direction';

export class ViewportPadding {
  forward: Padding;
  backward: Padding;

  constructor(element) {
    this.forward = new Padding(element, Direction.forward);
    this.backward = new Padding(element, Direction.backward);
  }
}

export class Viewport {

  private host = null;
  scrollable = null;
  padding: ViewportPadding;

  constructor(elementRef: ElementRef) {
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

  getSize(): number {
    return this.scrollable.getBoundingClientRect().height;
  }

  getEdge(direction: Direction, opposite?: boolean): number {
    const params = this.scrollable.getBoundingClientRect();
    return params[direction === (!opposite ? Direction.forward : Direction.backward) ? 'bottom' : 'top'];
  }

  static getItemEdge(element, direction: Direction, opposite?: boolean): number {
    const params = element.getBoundingClientRect();
    return params[direction === (!opposite ? Direction.forward : Direction.backward) ? 'bottom' : 'top'];
  }

  static hideItem(element) {
    element.style.display = 'none';
  }

}
