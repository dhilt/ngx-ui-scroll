import { Direction } from '../interfaces/direction';
import { Routines } from './domRoutines';

export class Padding {

  element = null;
  direction: Direction;
  routines: Routines;

  constructor(element, direction: Direction, routines: Routines) {
    this.element = element.querySelector(`[data-padding-${direction}]`);
    this.direction = direction;
    this.routines = routines;
  }

  get size(): number {
    return this.routines.getSizeStyle(this.element);
  }

  set size(value: number) {
    this.routines.setSizeStyle(this.element, value);
  }

  getEdge(): number {
    return this.routines.getEdge(this.element, this.direction, true);
  }

}
