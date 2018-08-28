export class ClipByDirection {
  size: number;

  get shouldClip(): boolean {
    return !!this.size;
  }

  constructor() {
    this.reset();
  }

  reset() {
    this.size = 0;
  }
}

export class ClipModel {
  forward: ClipByDirection;
  backward: ClipByDirection;

  get size(): number {
    return this.backward.size + this.forward.size;
  }

  get shouldClip(): boolean {
    return this.backward.shouldClip || this.forward.shouldClip;
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
