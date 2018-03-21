import { Direction } from '../interfaces/direction';
import { Settings } from './settings';

export class Routines {

  private horizontal: boolean;

  constructor(settings: Settings) {
    this.horizontal = settings.horizontal;
  }

  getScrollPosition(element): number {
    return element[this.horizontal ? 'scrollLeft' : 'scrollTop'];
  }

  setScrollPosition(element, value: number) {
    element[this.horizontal ? 'scrollLeft' : 'scrollTop'] = value;
  }

  getParams(element): ClientRect {
    return element.getBoundingClientRect();
  }

  getSize(element): number {
    return this.getParams(element)[this.horizontal ? 'width' : 'height'];
  }

  getSizeStyle(element): number {
    return parseInt(element.style[this.horizontal ? 'width' : 'height'], 10) || 0;
  }

  setSizeStyle(element, value: number) {
    element.style[this.horizontal ? 'width' : 'height'] = `${value}px`;
  }

  getScrollableSize(element): number {
    return element[this.horizontal ? 'scrollWidth' : 'scrollHeight'];
  }

  getRectEdge(params: ClientRect, direction: Direction, opposite: boolean): number {
    const forward = !opposite ? Direction.forward : Direction.backward;
    return params[direction === forward ? (this.horizontal ? 'right' : 'bottom') : (this.horizontal ? 'left' : 'top')];
  }

  getEdge(element, direction: Direction, opposite: boolean): number {
    const params = this.getParams(element);
    return this.getRectEdge(params, direction, opposite);
  }

  getEdge2(element, direction: Direction, relativeElement, opposite: boolean): number {
    // vertical only ?
    return element.offsetTop - (relativeElement ? relativeElement.scrollTop : 0) +
      (direction === (!opposite ? Direction.forward : Direction.backward) ? this.getSize(element) : 0);
  }

  hideElement(element) {
    element.style.display = 'none';
  }

}
