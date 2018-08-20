import { Direction } from '../interfaces/direction';
import { Settings } from './settings';

export class Routines {

  readonly horizontal: boolean;

  constructor(settings: Settings) {
    this.horizontal = settings.horizontal;
  }

  getScrollPosition(element: HTMLElement): number {
    return element[this.horizontal ? 'scrollLeft' : 'scrollTop'];
  }

  setScrollPosition(element: HTMLElement, value: number) {
    element[this.horizontal ? 'scrollLeft' : 'scrollTop'] = value;
  }

  static getWindowParam(horizontal?: boolean): number {
    const innerParam = horizontal ? 'innerWidth' : 'innerHeight';
    const clientParam = horizontal ? 'clientWidth' : 'clientHeight';
    return window[innerParam] && document.documentElement[clientParam] ?
      Math.min(window[innerParam], document.documentElement[clientParam]) :
      window[innerParam] ||
      document.documentElement[clientParam] ||
      document.getElementsByTagName('body')[0][clientParam];
  }

  static getWindowParams(): ClientRect {
    const width = Routines.getWindowParam(true);
    const height = Routines.getWindowParam(false);
    return <ClientRect>{
      'height': height,
      'width': width,
      'top': 0,
      'bottom': height,
      'left': 0,
      'right': width
    };
  }

  getParams(element: HTMLElement): ClientRect {
    return element.tagName.toLowerCase() === 'body' ?
      Routines.getWindowParams() :
      element.getBoundingClientRect();
  }

  getSize(element: HTMLElement): number {
    return this.getParams(element)[this.horizontal ? 'width' : 'height'];
  }

  getSizeStyle(element: HTMLElement): number {
    const size = element.style[this.horizontal ? 'width' : 'height'];
    return parseInt(<string>size, 10) || 0;
  }

  setSizeStyle(element: HTMLElement, value: number) {
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
    element.style.display = 'none';
  }

}
