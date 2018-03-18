import { ElementRef } from '@angular/core';
import { Padding } from './padding';
import { Direction } from '../interfaces/direction';
import { Routines } from '../utils/domRoutines';
import { Settings } from './settings';

export class ViewportPadding {
  forward: Padding;
  backward: Padding;

  constructor(element, horizontal: boolean) {
    this.forward = new Padding(element, Direction.forward, horizontal);
    this.backward = new Padding(element, Direction.backward, horizontal);
  }
}

export class Viewport {

  private settings: Settings;
  private host;
  scrollable;
  padding: ViewportPadding;
  syntheticScrollPosition: number;

  private lastPosition: number;

  constructor(elementRef: ElementRef, settings: Settings) {
    this.settings = settings;
    this.host = elementRef.nativeElement;
    this.scrollable = elementRef.nativeElement.parentElement;
    this.padding = new ViewportPadding(this.host, settings.horizontal);
    this.syntheticScrollPosition = null;
  }

  get children(): HTMLCollection {
    return this.host.children;
  }

  get scrollPosition(): number {
    return Routines.getScrollPosition(this.scrollable, this.settings.horizontal);
  }

  set scrollPosition(value: number) {
    Routines.setScrollPosition(this.scrollable, value, this.settings.horizontal);
    this.syntheticScrollPosition = this.scrollPosition;
  }

  saveScrollPosition() {
    this.lastPosition = this.scrollPosition;
  }

  getLastPosition(): number {
    return this.lastPosition;
  }

  getSize(): number {
    return Routines.getSize(this.scrollable, this.settings.horizontal);
  }

  getScrollableSize(): number {
    return Routines.getScrollableSize(this.scrollable, this.settings.horizontal);
  }

  getBufferPadding(): number {
    return this.getSize() * this.settings.padding;
  }

  getEdge(direction: Direction, opposite?: boolean): number {
    return Routines.getEdge(this.scrollable, direction, opposite, this.settings.horizontal);
  }

  getLimit(direction: Direction, opposite?: boolean): number {
    return this.getEdge(direction, opposite) +
      (direction === (!opposite ? Direction.forward : Direction.backward) ? 1 : -1) * this.getBufferPadding();
  }

}
