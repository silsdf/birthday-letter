export class MovementController {
  constructor(speed = 96) {
    this.speed = speed;
    this.keys = new Set();
    this.direction = "down";

    addEventListener("keydown", event => this.setKey(event, true));
    addEventListener("keyup", event => this.setKey(event, false));
  }

  setKey(event, pressed) {
    const key = event.key.toLowerCase();
    if (!["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
      return;
    }

    event.preventDefault();
    if (pressed) {
      this.keys.add(key);
    } else {
      this.keys.delete(key);
    }
  }

  read() {
    let x = 0;
    let y = 0;

    if (this.keys.has("arrowleft") || this.keys.has("a")) x -= 1;
    if (this.keys.has("arrowright") || this.keys.has("d")) x += 1;
    if (this.keys.has("arrowup") || this.keys.has("w")) y -= 1;
    if (this.keys.has("arrowdown") || this.keys.has("s")) y += 1;

    if (x || y) {
      this.direction = Math.abs(x) > Math.abs(y)
        ? (x > 0 ? "right" : "left")
        : (y > 0 ? "down" : "up");
    }

    return {
      x,
      y,
      moving: Boolean(x || y),
      direction: this.direction
    };
  }
}

