import { Direction } from '../interfaces/direction';

export class Routines {

  static getScrollPosition(element): number {
    return element['scrollTop'];
  }

  static setScrollPosition(element, value: number) {
    element['scrollTop'] = value;
  }

  static getParams(element): DOMRect {
    return element.getBoundingClientRect();
  }

  static getSize(element): number {
    return Routines.getParams(element)['height'];
  }

  static getScrollableSize(element): number {
    return element['scrollHeight'];
  }

  static getRectEdge(params: DOMRect, direction: Direction, opposite?: boolean): number {
    const forward = !opposite ? Direction.forward : Direction.backward;
    return params[direction === forward ? 'bottom' : 'top'];
  }

  static getEdge(element, direction: Direction, opposite?: boolean): number {
    const params = Routines.getParams(element);
    return Routines.getRectEdge(params, direction, opposite);
  }

  static getEdge2(element, direction: Direction, relativeElement?, opposite?: boolean): number {
    const result = element.offsetTop - (relativeElement ? relativeElement.scrollTop : 0) +
      (direction === (!opposite ? Direction.forward : Direction.backward) ? Routines.getSize(element) : 0);
    return result;
  }

  static hideElement(element) {
    element.style.display = 'none';
  }

}
