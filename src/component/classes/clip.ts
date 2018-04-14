import { Direction } from '../interfaces/direction';

export class ClipByDirection {
  shouldClip: boolean;
  size: number;
  items: number;

  constructor() {
    this.reset();
  }

  reset() {
    this.shouldClip = false;
    this.size = null;
    this.items = null;
  }
}

export class ClipPrevious {
  private backwardClip: ClipByDirection;
  private forwardClip: ClipByDirection;
  private _set: boolean;

  backwardSize: number;
  forwardSize: number;
  backwardItems: number;
  forwardItems: number;
  direction: Direction;

  constructor(clip: ClipModel) {
    this.backwardClip = clip.backward;
    this.forwardClip = clip.forward;
    this._set = false;
  }

  isSet(): boolean {
    return this._set;
  }

  set(direction: Direction) {
    this._set = true;
    this.backwardSize = this.backwardClip.size;
    this.forwardSize = this.forwardClip.size;
    this.backwardItems = this.backwardClip.items;
    this.forwardItems = this.forwardClip.items;
    this.direction = direction;
  }

  reset() {
    this._set = false;
  }
}

export class ClipModel {
  forward: ClipByDirection;
  backward: ClipByDirection;

  previous: ClipPrevious;

  constructor() {
    this.forward = new ClipByDirection();
    this.backward = new ClipByDirection();
    this.previous = new ClipPrevious(this);
  }

  get shouldClip(): boolean {
    return this[Direction.forward].shouldClip || this[Direction.backward].shouldClip;
  }

  reset() {
    this.backward.reset();
    this.forward.reset();
  }
}
