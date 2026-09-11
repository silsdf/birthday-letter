import { SPRITE_GRID } from "../character/sprite-meta.js";

export class AnimationController {
  constructor() {
    this.direction = "down";
    this.state = "idle";
    this.frameIndex = 0;
    this.sequenceIndex = 0;
    this.elapsed = 0;
  }

  update(deltaSeconds, moving, direction) {
    const nextDirection = direction || this.direction;
    const nextState = moving ? "walk" : "idle";

    if (nextDirection !== this.direction || nextState !== this.state) {
      this.direction = nextDirection;
      this.state = nextState;
      this.sequenceIndex = 0;
      this.frameIndex = 0;
      this.elapsed = 0;
    }

    if (!moving) {
      return;
    }

    if (direction) {
      this.direction = direction;
    }

    const frames = SPRITE_GRID.walkFrames;
    const fps = 5;

    this.elapsed += deltaSeconds;
    if (this.elapsed >= 1 / fps) {
      this.elapsed = 0;
      this.sequenceIndex = (this.sequenceIndex + 1) % frames.length;
      this.frameIndex = frames[this.sequenceIndex];
    }
  }
}
