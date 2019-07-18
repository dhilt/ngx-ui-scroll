import { ElementRef } from '@angular/core';

import { Direction } from '../interfaces/index';
import { Paddings } from './paddings';
import { Settings } from './settings';
import { Routines } from './domRoutines';
import { State } from './state';
import { Buffer } from './buffer';
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
  readonly buffer: Buffer;
  readonly logger: Logger;

  private disabled: boolean;

  constructor(elementRef: ElementRef, settings: Settings, routines: Routines, state: State, buffer: Buffer, logger: Logger) {
    this.settings = settings;
    this.routines = routines;
    this.state = state;
    this.buffer = buffer;
    this.logger = logger;
    this.element = elementRef.nativeElement;
    this.disabled = false;

    if (settings.windowViewport) {
      this.host = (<Document>this.element.ownerDocument).body;
      this.scrollEventElement = <Document>(this.element.ownerDocument);
      this.scrollable = <HTMLElement>this.scrollEventElement.scrollingElement;
    } else {
      this.host = <HTMLElement>this.element.parentElement;
      this.scrollEventElement = this.host;
      this.scrollable = <HTMLElement>this.element.parentElement;
    }

    this.paddings = new Paddings(this.element, routines, settings, buffer);

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
      const { itemSize } = this.settings;
      this.state.bwdPaddingAverageSizeItemsCount = itemSize ? negativeSize / itemSize : 0;
    }
    this.scrollPosition = newPosition;
    this.state.scrollState.reset();
    // this.state.syntheticScroll.reset(scrollPosition !== newPosition ? newPosition : null);
    this.startDelta = 0;
  }

  setPosition(value: number, oldPosition?: number): number {
    if (oldPosition === undefined) {
      oldPosition = this.scrollPosition;
    }
    if (oldPosition === value) {
      this.logger.log(() => ['setting scroll position at', value, '[cancelled]']);
      return value;
    }
    this.routines.setScrollPosition(this.scrollable, value);
    const position = this.scrollPosition;
    this.logger.log(() => ['setting scroll position at', position]);
    return position;
  }

  get scrollPosition(): number {
    return this.routines.getScrollPosition(this.scrollable);
  }

  set scrollPosition(value: number) {
    const oldPosition = this.scrollPosition;
    const newPosition = this.setPosition(value, oldPosition);
    const { syntheticScroll, scrollState } = this.state;
    syntheticScroll.push(newPosition, oldPosition, scrollState.getData());
  }

  disableScrollForOneLoop() {
    if (this.disabled) {
      return;
    }
    const { style } = this.scrollable;
    if (style.overflowY === 'hidden') {
      return;
    }
    this.disabled = true;
    const overflow = style.overflowY;
    setTimeout(() => {
      this.disabled = false;
      style.overflowY = overflow;
    });
    style.overflowY = 'hidden';
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
