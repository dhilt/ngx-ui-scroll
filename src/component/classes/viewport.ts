import { ElementRef } from '@angular/core';

import { Direction } from '../interfaces/index';
import { Paddings } from './paddings';
import { Settings } from './settings';
import { Routines } from './domRoutines';
import { State } from './state';
import { Logger } from './logger';

export class Viewport {

  paddings: Paddings;
  startDelta: number;

  readonly element: HTMLElement;
  readonly host: HTMLElement;
  readonly scrollEventElement: HTMLElement | Document;
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
      this.scrollEventElement = this.element.ownerDocument;
      this.scrollable = <HTMLElement>this.scrollEventElement.scrollingElement;
    } else {
      this.host = <HTMLElement>this.element.parentElement;
      this.scrollEventElement = this.host;
      this.scrollable = <HTMLElement>this.element.parentElement;
    }

    this.paddings = new Paddings(this.element, this.routines, settings);

    if (settings.windowViewport && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }

  reset(scrollPosition: number) {
    let newPosition = 0;
    this.paddings.reset(this.getSize(), this.state.startIndex);
    const negativeSize = this.paddings.backward.size;
    if (negativeSize) {
      newPosition = negativeSize;
      this.state.bwdPaddingAverageSizeItemsCount = negativeSize / this.settings.itemSize;
    }
    this.scrollPosition = newPosition;
    this.state.scrollState.reset();
    this.state.syntheticScroll.reset(scrollPosition !== newPosition ? newPosition : null);
    this.startDelta = 0;
  }

  get scrollPosition(): number {
    return this.routines.getScrollPosition(this.scrollable);
  }

  set scrollPosition(value: number) {
    const oldPosition = this.scrollPosition;
    if (oldPosition === value) {
      this.logger.log(() => ['setting scroll position at', value, '[cancelled]']);
      return;
    }
    this.logger.log(() => ['setting scroll position at', value]);
    this.routines.setScrollPosition(this.scrollable, value);
    const synthState = this.state.syntheticScroll;
    synthState.time = Number(Date.now());
    synthState.position = this.scrollPosition;
    synthState.delta = synthState.position - oldPosition;
    if (synthState.positionBefore === null) {
      // syntheticScroll.positionBefore should be set once per cycle
      synthState.positionBefore = oldPosition;
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

  getOffset(): number {
    return this.routines.getOffset(this.element);
  }

}
