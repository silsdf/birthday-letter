import { PlayerComponent } from "./player/player-component.js";
import { DEFAULT_PLAYER_CONFIG, STORAGE_KEY } from "./character/sprite-meta.js";
import {
  BEDROOM_SIZE,
  collisionRects,
  interactionZones,
  playerBounds,
  playerSpawn
} from "./bedroom-map.js?v=5";
import { TASKS, allTasksComplete, isTaskComplete } from "./game-progress.js";

const BACKGROUND_SRC = "sunny_bedroom_scene_v6_blocks.png";
const PLAYER_FOOTPRINT = {
  offsetX: 58,
  offsetY: 82,
  width: 28,
  height: 14
};
const PLAYER_SCENE_SCALE = 2.7;
const PLAYER_SCENE_SPEED = 410;
const BACKGROUND_PIXEL_RATIO = 1;

export class BedroomScene {
  constructor(canvas, promptElement, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.promptElement = promptElement;
    this.background = new Image();
    this.onInteract = options.onInteract || null;
    this.startPosition = options.startPosition || playerSpawn;
    this.activeZone = null;
    this.lastTime = performance.now();

    this.canvas.width = BEDROOM_SIZE.width;
    this.canvas.height = BEDROOM_SIZE.height;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  async start() {
    const config = this.loadPlayerConfig();
    this.player = new PlayerComponent(config, this.startPosition.x, this.startPosition.y);
    this.player.movement.speed = PLAYER_SCENE_SPEED;

    await Promise.all([
      this.loadImage(this.background, BACKGROUND_SRC),
      this.player.load()
    ]);

    this.pixelBackground = this.createPixelBackground();
    window.addEventListener("keydown", this.handleKeyDown);
    this.canvas.addEventListener("click", this.handleClick);
    requestAnimationFrame(time => this.loop(time));
  }

  loadPlayerConfig() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_PLAYER_CONFIG;
    } catch {
      return DEFAULT_PLAYER_CONFIG;
    }
  }

  loadImage(image, src) {
    return new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = src;
    });
  }

  createPixelBackground() {
    const small = document.createElement("canvas");
    small.width = BEDROOM_SIZE.width * BACKGROUND_PIXEL_RATIO;
    small.height = BEDROOM_SIZE.height * BACKGROUND_PIXEL_RATIO;

    const smallCtx = small.getContext("2d");
    smallCtx.imageSmoothingEnabled = false;
    smallCtx.drawImage(this.background, 0, 0, small.width, small.height);
    return small;
  }

  loop(time) {
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;
    this.update(delta);
    this.draw();
    requestAnimationFrame(nextTime => this.loop(nextTime));
  }

  update(delta) {
    const previous = { x: this.player.x, y: this.player.y };
    this.player.update(delta, playerBounds);

    if (this.collides(this.playerFeetRect())) {
      this.player.x = previous.x;
      this.player.y = previous.y;
    }

    this.activeZone = this.findActiveZone();
    this.updatePrompt();
  }

  playerFeetRect() {
    return {
      x: this.player.x + PLAYER_FOOTPRINT.offsetX,
      y: this.player.y + PLAYER_FOOTPRINT.offsetY,
      width: PLAYER_FOOTPRINT.width,
      height: PLAYER_FOOTPRINT.height
    };
  }

  collides(rect) {
    return collisionRects.some(block => intersects(rect, block));
  }

  findActiveZone() {
    const feet = this.playerFeetRect();
    return interactionZones.find(zone => (!zone.requiresAllComplete || allTasksComplete()) && intersects(feet, zone)) || null;
  }

  updatePrompt() {
    if (!this.promptElement) return;
    this.promptElement.hidden = !this.activeZone;
    this.promptElement.textContent = this.activeZone
      ? this.activeZone.requiresAllComplete
        ? `按 E / 点击：${this.activeZone.prompt}`
        : isTaskComplete(this.activeZone.id)
        ? `${this.activeZone.prompt}已完成`
        : `按 E / 点击：${this.activeZone.prompt}`
      : "";
  }

  handleKeyDown(event) {
    if (event.key.toLowerCase() === "e") {
      this.triggerInteraction();
    }
  }

  handleClick() {
    this.triggerInteraction();
  }

  triggerInteraction() {
    if (!this.activeZone) return;
    if (!this.activeZone.requiresAllComplete && isTaskComplete(this.activeZone.id)) return;
    if (this.onInteract) {
      this.onInteract(this.activeZone);
      return;
    }
    const task = TASKS[this.activeZone.id];
    if (task) {
      window.location.href = task.url;
      return;
    }
    console.log(`[interaction] ${this.activeZone.id}: ${this.activeZone.prompt}`);
  }

  getPlayerPosition() {
    return { x: this.player.x, y: this.player.y };
  }

  draw() {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.pixelBackground, 0, 0, BEDROOM_SIZE.width, BEDROOM_SIZE.height);
    this.ctx.save();
    this.ctx.translate(this.player.x + 72, this.player.y + 88);
    this.ctx.scale(PLAYER_SCENE_SCALE, PLAYER_SCENE_SCALE);
    this.ctx.translate(-(this.player.x + 72), -(this.player.y + 88));
    this.player.draw(this.ctx);
    this.ctx.restore();
  }
}

function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
