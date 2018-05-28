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

  scrollable;
  padding: ViewportPadding;
  syntheticScrollPosition: number;

  readonly host;
  readonly routines: Routines;
  private settings: Settings;
  private lastPosition: number;

  constructor(elementRef: ElementRef, settings: Settings, routines: Routines) {
    this.settings = settings;
    this.routines = routines;
    this.host = elementRef.nativeElement;
    this.padding = new ViewportPadding(this.host, this.routines, settings);
    this.syntheticScrollPosition = null;

    if (settings.windowViewport) {
      this.scrollable = elementRef.nativeElement.ownerDocument;
    } else {
      this.scrollable = elementRef.nativeElement.parentElement;
    }
  }

  reset() {
    this.scrollPosition = 0;
    this.lastPosition = 0;
    this.syntheticScrollPosition = null;
    this.padding.reset();
  }

  get children(): HTMLCollection {
    return this.host.children;
  }

  get scrollPosition(): number {
    return this.routines.getScrollPosition(this.scrollable);
  }

  set scrollPosition(value: number) {
    this.routines.setScrollPosition(this.scrollable, value);
  }

  saveScrollPosition() {
    this.lastPosition = this.scrollPosition;
  }

  getLastPosition(): number {
    return this.lastPosition;
  }

  getSize(): number {
    return this.routines.getSize(this.scrollable);
  }

  getScrollableSize(): number {
    return this.routines.getScrollableSize(this.scrollable);
  }

  getBufferPadding(): number {
    return this.getSize() * this.settings.padding;
  }

  getEdge(direction: Direction, opposite?: boolean): number {
    return this.routines.getEdge(this.scrollable, direction, opposite);
  }

  getLimit(direction: Direction, opposite?: boolean): number {
    return this.getEdge(direction, opposite) +
      (direction === (!opposite ? Direction.forward : Direction.backward) ? 1 : -1) * this.getBufferPadding();
  }

}
