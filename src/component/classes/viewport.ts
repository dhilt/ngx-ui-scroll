import { Direction } from '../interfaces/index';
import { Paddings } from './paddings';
import { Settings } from './settings';
import { Routines } from './domRoutines';
import { State } from './state';
import { Logger } from './logger';

export class Viewport {

  offset: number;
  paddings: Paddings;
  previousPosition: number;
  scrollAnchoring: boolean;

  readonly element: HTMLElement;
  readonly settings: Settings;
  readonly routines: Routines;
  readonly state: State;
  readonly logger: Logger;

  readonly hostElement: HTMLElement;
  readonly scrollEventReceiver: HTMLElement | Window;

  private disabled: boolean;

  constructor(element: HTMLElement, settings: Settings, routines: Routines, state: State, logger: Logger) {
    this.element = element;
    this.settings = settings;
    this.routines = routines;
    this.state = state;
    this.logger = logger;
    this.disabled = false;

    if (settings.windowViewport) {
      this.hostElement = document.documentElement as HTMLElement;
      this.scrollEventReceiver = window;
    } else {
      this.hostElement = this.element.parentElement as HTMLElement;
      this.scrollEventReceiver = this.hostElement;
    }

    this.paddings = new Paddings(this.element, this.routines, settings);

    if (settings.windowViewport && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }

  reset(scrollPosition: number) {
    this.setOffset();
    this.paddings.reset(this.getSize(), this.state.startIndex, this.offset);
    this.scrollPosition = this.paddings.backward.size || 0;
    this.state.scrollState.reset();
    this.scrollAnchoring = !this.isAnchoringOff();
  }

  setPosition(value: number): number {
    const oldPosition = this.scrollPosition;
    if (oldPosition === value) {
      this.logger.log(() => ['setting scroll position at', value, '[cancelled]']);
      return value;
    }
    this.previousPosition = oldPosition;
    this.routines.setScrollPosition(this.hostElement, value);
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
    this.routines.setScrollPosition(this.hostElement, oldPos);
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
        this.routines.setScrollPosition(this.hostElement, newPos);
        done();
      });
  }

  get scrollPosition(): number {
    return this.routines.getScrollPosition(this.hostElement);
  }

  set scrollPosition(value: number) {
    this.setPosition(value);
  }

  disableScrollForOneLoop() {
    if (this.disabled) {
      return;
    }
    const { style } = this.hostElement;
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
    return this.routines.getSize(this.hostElement, true);
  }

  getScrollableSize(): number {
    return this.routines.getSize(this.element);
  }

  getBufferPadding(): number {
    return this.getSize() * this.settings.padding;
  }

  getEdge(direction: Direction): number {
    return this.routines.getEdge(this.hostElement, direction, true);
  }

  setOffset() {
    this.offset = this.routines.getOffset(this.element);
    if (!this.settings.windowViewport) {
      this.offset -= this.routines.getOffset(this.hostElement);
    }
  }

  isAnchoringOff(): boolean {
    if (this.settings.windowViewport) {
      if (this.routines.isAnchoringOff((this.element.ownerDocument as Document).body)) {
        return true;
      }
    }
    return this.routines.isAnchoringOff(this.hostElement);
  }

}
