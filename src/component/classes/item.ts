import { Direction } from '../interfaces/direction';
import { Routines } from './domRoutines';

export class Item {
  $index: number;
  data: any;
  nodeId: string;
  routines: Routines;
  size: number;

  element: any;
  invisible: boolean;
  toRemove: boolean;

  constructor($index: number, data: any, routines: Routines) {
    this.$index = $index;
    this.data = data;
    this.nodeId = String($index);
    this.routines = routines;
    this.invisible = true;
  }

  setSize() {
    this.size = this.routines.getSize(this.element);
  }

  getEdge(direction: Direction): number {
    return this.routines.getEdge(this.element, direction, false);
  }

  hide() {
    this.routines.hideElement(this.element);
  }

}
