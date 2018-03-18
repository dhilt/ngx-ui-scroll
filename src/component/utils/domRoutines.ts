import { Direction } from '../interfaces/direction';

export class Routines {

  static getScrollPosition(element, horizontal: boolean): number {
    return element[!horizontal ? 'scrollTop' : 'scrollLeft'];
  }

  static setScrollPosition(element, value: number, horizontal: boolean) {
    element[!horizontal ? 'scrollTop' : 'scrollLeft'] = value;
  }

  static getParams(element): ClientRect {
    return element.getBoundingClientRect();
  }

  static getSize(element, horizontal: boolean): number {
    return Routines.getParams(element)[!horizontal ? 'height' : 'width'];
  }

  static getScrollableSize(element, horizontal: boolean): number {
    return element[!horizontal ? 'scrollHeight' : 'scrollWidth'];
  }

  static getRectEdge(params: ClientRect, direction: Direction, opposite: boolean, horizontal: boolean): number {
    const forward = !opposite ? Direction.forward : Direction.backward;
    return params[direction === forward ? (!horizontal ? 'bottom' : 'right') : (!horizontal ? 'top' : 'left')];
  }

  static getEdge(element, direction: Direction, opposite: boolean, horizontal: boolean): number {
    const params = Routines.getParams(element);
    return Routines.getRectEdge(params, direction, opposite, horizontal);
  }

  static getEdge2(element, direction: Direction, relativeElement, opposite: boolean, horizontal: boolean): number {
    // vertical only ?
    return element.offsetTop - (relativeElement ? relativeElement.scrollTop : 0) +
      (direction === (!opposite ? Direction.forward : Direction.backward) ? Routines.getSize(element, horizontal) : 0);
  }

  static hideElement(element) {
    element.style.display = 'none';
  }

}
