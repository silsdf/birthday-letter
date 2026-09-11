import { AnimationController } from "../animation/animation-controller.js";
import { MovementController } from "./movement-controller.js";
import { SpriteRenderer } from "./sprite-renderer.js";

export class PlayerComponent {
  constructor(config, x, y) {
    this.config = config;
    this.x = x;
    this.y = y;
    this.animation = new AnimationController();
    this.movement = new MovementController();
    this.renderer = new SpriteRenderer(3);
  }

  async load() {
    await this.renderer.load(this.config);
  }

  update(deltaSeconds, bounds) {
    const input = this.movement.read();
    const length = Math.hypot(input.x, input.y) || 1;

    this.x += (input.x / length) * this.movement.speed * deltaSeconds;
    this.y += (input.y / length) * this.movement.speed * deltaSeconds;
    this.x = Math.max(bounds.left, Math.min(bounds.right, this.x));
    this.y = Math.max(bounds.top, Math.min(bounds.bottom, this.y));

    this.animation.update(deltaSeconds, input.moving, input.direction);
  }

  draw(ctx) {
    this.renderer.draw(ctx, this.config, this.animation, this.x, this.y);
  }
}
