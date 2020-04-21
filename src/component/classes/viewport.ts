import { Direction } from '../interfaces/index';
import { Paddings } from './paddings';
import { Settings } from './settings';
import { Routines } from './domRoutines';
import { State } from './state';
import { Logger } from './logger';

export class Viewport {

  paddings: Paddings;
  startDelta: number;
  previousPosition: number;

  readonly element: HTMLElement;
  readonly host: HTMLElement;
  readonly scrollEventElement: HTMLElement | Document;
  readonly scrollable: HTMLElement;
  readonly settings: Settings;
  readonly routines: Routines;
  readonly state: State;
  readonly logger: Logger;

  private disabled: boolean;

  constructor(element: HTMLElement, settings: Settings, routines: Routines, state: State, logger: Logger) {
    this.element = element;
    this.settings = settings;
    this.routines = routines;
    this.state = state;
    this.logger = logger;
    this.disabled = false;

    if (settings.windowViewport) {
      this.scrollEventElement = this.element.ownerDocument as Document;
      this.host = this.scrollEventElement.body;
      this.scrollable = this.scrollEventElement.scrollingElement as HTMLElement;
    } else {
      this.host = this.element.parentElement as HTMLElement;
      this.scrollEventElement = this.host.parentElement as HTMLElement;
      this.scrollable = this.host.parentElement as HTMLElement;
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
      const { itemSize } = this.settings;
      this.state.bwdPaddingAverageSizeItemsCount = itemSize ? negativeSize / itemSize : 0;
    }
    this.scrollPosition = newPosition;
    this.state.scrollState.reset();
    this.startDelta = 0;
  }

  setPosition(value: number): number {
    const oldPosition = this.scrollPosition;
    if (oldPosition === value) {
      this.logger.log(() => ['setting scroll position at', value, '[cancelled]']);
      return value;
    }
    this.previousPosition = oldPosition;
    this.routines.setScrollPosition(this.scrollable, value);
    const position = this.scrollPosition;
    this.logger.log(() => [
      'setting scroll position at', position, ...(position !== value ? [`(${value})`] : [])
    ]);
    return position;
  }

  setPositionSafe(oldPos: number, newPos: number, done: Function) {
    const { scrollState } = this.state;
    scrollState.syntheticPosition = newPos;
    this.logger.log(() => ['setting scroll position at', oldPos, '(meaning', newPos, 'in next repaint)']);
    this.routines.setScrollPosition(this.scrollable, oldPos);
    scrollState.syntheticFulfill = false;
    scrollState.animationFrameId =
      requestAnimationFrame(() => {
        const diff = oldPos - this.scrollPosition;
        if (diff > 0) {
          newPos -= diff;
          scrollState.syntheticPosition = newPos;
        }
        scrollState.syntheticFulfill = true;
        this.logger.log(() => [
          'setting scroll position at', newPos,
          ...(diff > 0 ? [`(${(newPos + diff)} - ${diff})`] : []),
          '- synthetic fulfillment'
        ]);
        this.routines.setScrollPosition(this.scrollable, newPos);
        done();
      });
  }

  get scrollPosition(): number {
    return this.routines.getScrollPosition(this.scrollable);
  }

  set scrollPosition(value: number) {
    this.setPosition(value);
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
