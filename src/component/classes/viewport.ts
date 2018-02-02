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

  element = null;
  scrollable = null;
  padding: ViewportPadding;

  constructor(elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
    this.scrollable = elementRef.nativeElement.parentElement;
    this.padding = new ViewportPadding(this.element);
  }

  get scrollPosition(): number {
    return this.scrollable.scrollTop;
  }
  set scrollPosition(value: number) {
    this.scrollable.scrollTop = value;
  }

}
