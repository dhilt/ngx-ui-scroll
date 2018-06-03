import { ElementRef } from '@angular/core';
import { Padding } from './padding';
import { Direction } from '../interfaces/index';
import { Routines } from './domRoutines';
import { Settings } from './settings';

export class ViewportPadding {
  forward: Padding;
  backward: Padding;

  constructor(element, routines: Routines, settings: Settings) {
    this.forward = new Padding(element, Direction.forward, routines, settings.paddingForwardSize);
    this.backward = new Padding(element, Direction.backward, routines, settings.paddingBackwardSize);
  }

  reset() {
    this.forward.reset();
    this.backward.reset();
  }
}

export class Viewport {

  padding: ViewportPadding;
  syntheticScrollPosition: number;

  readonly element;
  readonly host;
  readonly scrollable;
  readonly routines: Routines;
  private settings: Settings;

  constructor(elementRef: ElementRef, settings: Settings, routines: Routines) {
    this.settings = settings;
    this.routines = routines;
    this.element = elementRef.nativeElement;
    this.padding = new ViewportPadding(this.element, this.routines, settings);
    this.syntheticScrollPosition = null;

    if (settings.windowViewport) {
      this.host = this.element.ownerDocument.body;
      this.scrollable = this.element.ownerDocument.scrollingElement;
    } else {
      this.host = this.element.parentElement;
      this.scrollable = this.element.parentElement;
    }
  }

  reset() {
    this.scrollPosition = 0;
    this.syntheticScrollPosition = null;
    this.padding.reset();
  }

  get scrollEventElement() {
    return this.settings.windowViewport ? this.element.ownerDocument : this.host;
  }

  get children(): HTMLCollection {
    return this.element.children;
  }

  get scrollPosition(): number {
    return this.routines.getScrollPosition(this.scrollable);
  }

  set scrollPosition(value: number) {
    this.routines.setScrollPosition(this.scrollable, value);
  }

  getSize(): number {
    return this.routines.getSize(this.host);
  }

  getBufferPadding(): number {
    return this.getSize() * this.settings.padding;
  }

  getEdge(direction: Direction, opposite?: boolean): number {
    return this.routines.getEdge(this.host, direction, opposite);
  }

  getLimit(direction: Direction, opposite?: boolean): number {
    return this.getEdge(direction, opposite) +
      (direction === (!opposite ? Direction.forward : Direction.backward) ? 1 : -1) * this.getBufferPadding();
  }

}
