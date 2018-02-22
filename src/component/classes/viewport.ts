import { ElementRef } from '@angular/core';
import { Padding } from './padding';
import { Direction } from '../interfaces/direction';
import { Routines } from '../utils/domRoutines';
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
  syntheticScroll: boolean;

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
    return Routines.getScrollPosition(this.scrollable);
  }

  set scrollPosition(value: number) {
    this.syntheticScroll = true;
    Routines.setScrollPosition(this.scrollable, value);
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
    if (scrollPosition < this.padding[Direction.backward].size) {
      return Direction.backward;
    }
    if (lastScrollPosition < scrollPosition) {
      return Direction.forward;
    } else if (lastScrollPosition > scrollPosition) {
      return Direction.backward;
    }
    return;
  }

  getSize(): number {
    return Routines.getSize(this.scrollable);
  }

  getBufferPadding(): number {
    return this.getSize() * this.settings.padding;
  }

  getEdge(direction: Direction, opposite?: boolean): number {
    return Routines.getEdge(this.scrollable, direction, opposite);
  }

  getLimit(direction: Direction, opposite?: boolean): number {
    return this.getEdge(direction, opposite) +
      (direction === (!opposite ? Direction.forward : Direction.backward) ? 1 : -1) * this.getBufferPadding();
  }

}
