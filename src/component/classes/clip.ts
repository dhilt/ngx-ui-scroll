export class ClipByDirection {
  size: number;
  items: number;

  get shouldClip(): boolean {
    return !!this.size;
  }

  constructor() {
    this.reset();
  }

  reset() {
    this.size = 0;
    this.items = 0;
  }
}

export class ClipModel {
  forward: ClipByDirection;
  backward: ClipByDirection;

  get size(): number {
    return this.backward.size + this.forward.size;
  }

  get shouldClip(): boolean {
    return !!this.size;
  }

  constructor() {
    this.forward = new ClipByDirection();
    this.backward = new ClipByDirection();
    this.reset();
  }

  reset() {
    this.backward.reset();
    this.forward.reset();
  }
}
