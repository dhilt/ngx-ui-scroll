import { Direction } from '../interfaces/direction';

export class Routines {

  static getScrollPosition(element): number {
    return element.scrollTop;
  }

  static setScrollPosition(element, value: number) {
    element.scrollTop = value;
  }

  static getSize(element): number {
    return element.getBoundingClientRect().height;
  }

  static getEdge(element, direction: Direction, opposite?: boolean): number {
    const params = element.getBoundingClientRect();
    const result = params[direction === (!opposite ? Direction.forward : Direction.backward) ? 'bottom' : 'top'];
    return result;
  }

  getEdge2(element, direction: Direction, relativeElement?, opposite?: boolean): number {
    const result = element.offsetTop - (relativeElement ? relativeElement.scrollTop : 0) +
      (direction === (!opposite ? Direction.forward : Direction.backward) ? Routines.getSize(element) : 0);
    return result;
  }

  static hideElement(element) {
    element.style.display = 'none';
  }

}
