import { Direction } from '../interfaces/direction';
import { Routines } from '../utils/domRoutines';

export class Item {
  $index: number;
  data: any;
  nodeId: string;
  horizontal: boolean;

  element: any;
  invisible: boolean;
  toRemove: boolean;

  constructor($index, data, nodeId, horizontal) {
    this.$index = $index;
    this.data = data;
    this.nodeId = nodeId;
    this.horizontal = horizontal;
    this.invisible = true;
  }

  getParams() {
    return Routines.getParams(this.element);
  }

  getEdge(direction: Direction, opposite?: boolean): number {
    return Routines.getEdge(this.element, direction, opposite, this.horizontal);
  }

  hide() {
    Routines.hideElement(this.element);
  }

}
