import { ElementRef } from '@angular/core';

import { Direction } from '../interfaces/index';
import { Padding } from './padding';
import { Settings } from './settings';
import { Routines } from './domRoutines';
import { State } from './state';
import { Logger } from './logger';

export class ViewportPadding {
  forward: Padding;
  backward: Padding;

  constructor(element: HTMLElement, routines: Routines, settings: Settings, viewportSize: number) {
    let negativeSize, positiveSize;
    if (isFinite(settings.minIndex) && isFinite(settings.maxIndex)) {
      negativeSize = (settings.startIndex - settings.minIndex) * settings.itemSize;
      positiveSize = (settings.maxIndex - settings.startIndex + 1) * settings.itemSize;
    } else {
      negativeSize = 0;
      positiveSize = viewportSize;
    }
    this.forward = new Padding(element, Direction.forward, routines, positiveSize);
    this.backward = new Padding(element, Direction.backward, routines, negativeSize);
  }

  reset() {
    this.forward.reset();
    this.backward.reset();
  }
}

export class Viewport {

  padding: ViewportPadding;
  startDelta: number;

  readonly element: HTMLElement;
  readonly host: HTMLElement;
  readonly scrollable: HTMLElement;
  readonly settings: Settings;
  readonly routines: Routines;
  readonly state: State;
  readonly logger: Logger;

  constructor(elementRef: ElementRef, settings: Settings, routines: Routines, state: State, logger: Logger) {
    this.settings = settings;
    this.routines = routines;
    this.state = state;
    this.logger = logger;
    this.element = elementRef.nativeElement;

    if (settings.windowViewport) {
      this.host = this.element.ownerDocument.body;
      this.scrollable = <HTMLElement>this.element.ownerDocument.documentElement;
    } else {
      this.host = <HTMLElement>this.element.parentElement;
      this.scrollable = <HTMLElement>this.element.parentElement;
    }

    this.padding = new ViewportPadding(this.element, this.routines, settings, this.getSize());
    const negativeSize = this.padding[Direction.backward].size;
    if (negativeSize) {
      this.scrollPosition = negativeSize;
      state.bwdPaddingAverageSizeItemsCount = negativeSize / settings.itemSize;
    }
  }

  reset(scrollPosition: number) {
    const newPosition = 0;
    this.scrollPosition = newPosition;
    this.state.syntheticScroll.position = scrollPosition !== newPosition ? newPosition : null;
    this.state.syntheticScroll.positionBefore = null;
    this.state.syntheticScroll.delta = 0;
    this.state.syntheticScroll.time = 0;
    this.padding.reset();
    this.startDelta = 0;
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
    const oldPosition = this.scrollPosition;
    this.logger.log(() => ['Setting scroll position at', value]);
    this.routines.setScrollPosition(this.scrollable, value);
    this.state.syntheticScroll.time = Number(Date.now());
    this.state.syntheticScroll.position = this.scrollPosition;
    this.state.syntheticScroll.delta = this.state.syntheticScroll.position - oldPosition;
    if (this.state.syntheticScroll.positionBefore === null) {
      // syntheticScroll.positionBefore should be set once per cycle
      this.state.syntheticScroll.positionBefore = oldPosition;
    }
  }

  getSize(): number {
    return this.routines.getSize(this.host);
  }

  getScrollableSize(): number {
    return this.routines.getSize(this.element);
  }

  getBufferPadding(): number {
    return this.getSize() * this.settings.padding;
  }

  getEdge(direction: Direction, opposite?: boolean): number {
    return this.routines.getEdge(this.host, direction, opposite);
  }

  getElementEdge(element: HTMLElement, direction: Direction, opposite?: boolean): number {
    return this.routines.getEdge(element, direction, opposite);
  }

  getLimit(direction: Direction, opposite?: boolean): number {
    return this.getEdge(direction, opposite) +
      (direction === (!opposite ? Direction.forward : Direction.backward) ? 1 : -1) * this.getBufferPadding();
  }

  getClipLimit(direction: Direction, clipPaddingDelta: number, opposite?: boolean): number {
    return this.getEdge(direction, opposite) +
      (direction === (!opposite ? Direction.forward : Direction.backward) ? 1 : -1) *
      (this.getBufferPadding() + clipPaddingDelta);
  }

  isElementVisible(element: HTMLElement): boolean {
    return this.getElementEdge(element, Direction.forward) > this.getEdge(Direction.backward);
  }

  getOffset(): number {
    return this.routines.getOffset(this.element);
  }

}
