import { Routines } from './domRoutines';
import { Direction, ItemAdapter } from '../interfaces/index';

export class Item {
  nodeId: string;
  routines: Routines;
  size: number;
  invisible: boolean;
  toRemove: boolean;
  removeDirection: Direction;

  private container: ItemAdapter;

  get $index(): number {
    return this.container.$index;
  }
  set $index(value: number) {
    this.container.$index = value;
  }

  get data(): any {
    return this.container.data;
  }
  set data(value: any) {
    this.container.data = value;
  }

  get element(): HTMLElement {
    return this.container.element as HTMLElement;
  }
  set element(value: HTMLElement) {
    this.container.element = value;
  }

  constructor($index: number, data: any, routines: Routines) {
    this.container = {
      $index,
      data
    };
    this.nodeId = String($index);
    this.routines = routines;
    this.invisible = true;
  }

  setSize() {
    this.size = this.routines.getSize(this.element);
  }

  hide() {
    if (this.element) {
      this.routines.hideElement(this.element);
    }
  }

  scrollTo(argument?: boolean | ScrollIntoViewOptions) {
    if (this.element) {
      this.routines.scrollTo(this.element, argument);
    }
  }

  updateIndex(index: number) {
    this.$index = index;
    this.nodeId = String(index);
  }

  get(): ItemAdapter {
    return this.container;
  }
}
