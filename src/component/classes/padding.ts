import { Direction } from '../interfaces/direction';
import { Routines } from './domRoutines';

export class Padding {

  element: HTMLElement;
  direction: Direction;
  routines: Routines;
  canBeReducedSafely: boolean;

  constructor(
    element: HTMLElement, hostElement: HTMLElement, direction: Direction, routines: Routines, initialSize?: number
  ) {
    this.element = <HTMLElement>element.querySelector(`[data-padding-${direction}]`);
    this.direction = direction;
    this.routines = routines;
    this.canBeReducedSafely = false;
    // if (direction === Direction.forward && !initialSize) {
    //   initialSize = this.routines.getSize(hostElement);
    // }
    if (initialSize) {
      this.routines.setSizeStyle(this.element, initialSize);
    }
  }

  reset() {
    this.size = 0;
    this.canBeReducedSafely = false;
  }

  get size(): number {
    return this.routines.getSizeStyle(this.element);
  }

  set size(value: number) {
    this.routines.setSizeStyle(this.element, Math.round(value));
  }

  getEdge(opposite = true): number {
    return this.routines.getEdge(this.element, this.direction, opposite);
  }

}
