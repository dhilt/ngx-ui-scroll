import { Direction } from '../interfaces/direction';
import { Settings } from './settings';

export class Routines {

  readonly horizontal: boolean;
  readonly window: boolean;

  constructor(settings: Settings) {
    this.horizontal = settings.horizontal;
    this.window = settings.windowViewport;
  }

  checkElement(element: HTMLElement) {
    if (!element) {
      throw new Error('HTML element is not defined');
    }
  }

  getScrollPosition(element: HTMLElement): number {
    this.checkElement(element);
    return element[this.horizontal ? 'scrollLeft' : 'scrollTop'];
  }

  setScrollPosition(element: HTMLElement, value: number) {
    this.checkElement(element);
    value = Math.max(0, value);
    element[this.horizontal ? 'scrollLeft' : 'scrollTop'] = value;
  }

  getParams(element: HTMLElement): ClientRect {
    this.checkElement(element);
    if (this.window) {
      return {
        'height': element.clientHeight,
        'width': element.clientWidth,
        'top': element.clientTop,
        'bottom': element.clientTop + element.clientHeight,
        'left': element.clientLeft,
        'right': element.clientLeft + element.clientWidth
      };
    }
    return element.getBoundingClientRect();
  }

  getSize(element: HTMLElement): number {
    return this.getParams(element)[this.horizontal ? 'width' : 'height'];
  }

  getSizeStyle(element: HTMLElement): number {
    this.checkElement(element);
    const size = element.style[this.horizontal ? 'width' : 'height'];
    return parseInt(size as string, 10) || 0;
  }

  setSizeStyle(element: HTMLElement, value: number) {
    this.checkElement(element);
    value = Math.max(0, value);
    element.style[this.horizontal ? 'width' : 'height'] = `${value}px`;
  }

  getRectEdge(params: ClientRect, direction: Direction, opposite?: boolean): number {
    const forward = !opposite ? Direction.forward : Direction.backward;
    return params[direction === forward ? (this.horizontal ? 'right' : 'bottom') : (this.horizontal ? 'left' : 'top')];
  }

  getEdge(element: HTMLElement, direction: Direction, opposite?: boolean): number {
    const params = this.getParams(element);
    return this.getRectEdge(params, direction, opposite);
  }

  getEdge2(element: HTMLElement, direction: Direction, relativeElement: HTMLElement, opposite: boolean): number {
    // vertical only ?
    return element.offsetTop - (relativeElement ? relativeElement.scrollTop : 0) +
      (direction === (!opposite ? Direction.forward : Direction.backward) ? this.getSize(element) : 0);
  }

  hideElement(element: HTMLElement) {
    this.checkElement(element);
    element.style.display = 'none';
  }

  getOffset(element: HTMLElement): number {
    this.checkElement(element);
    return (this.horizontal ? element.offsetLeft : element.offsetTop) || 0;
  }

  scrollTo(element: HTMLElement, argument?: boolean | ScrollIntoViewOptions) {
    this.checkElement(element);
    element.scrollIntoView(argument);
  }

  isAnchoringOff(element: HTMLElement): boolean {
    this.checkElement(element);
    const styles = getComputedStyle(element);
    const value = (styles as any).overflowAnchor;
    return value === void 0 || value === 'none';
  }

}
