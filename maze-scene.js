import { DEFAULT_PLAYER_CONFIG, STORAGE_KEY } from "./character/sprite-meta.js";
import { PlayerComponent } from "./player/player-component.js";
import { MAZE_SIZE, mazeBounds, mazeSpawn, mazeWalls, treasureZone } from "./maze-map.js";

const MAZE_BACKGROUND = "./assets/autumn-vn/maze.png";
const TREASURE_SOUND = "./assets/autumn-vn/treasure.mp3";
const MAZE_MUSIC = "./assets/autumn-vn/maze-music.mp3";
const MAZE_SPEED = 230;
const FOOTPRINT = {
  offsetX: 38,
  offsetY: 70,
  width: 20,
  height: 14
};

export class MazeScene {
  constructor(canvas, completeElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.completeElement = completeElement;
    this.background = new Image();
    this.treasureSound = new Audio(TREASURE_SOUND);
    this.treasureSound.preload = "auto";
    this.music = new Audio(MAZE_MUSIC);
    this.music.loop = true;
    this.music.volume = 0.28;
    this.lastTime = performance.now();
    this.completed = false;
    this.canvas.width = MAZE_SIZE.width;
    this.canvas.height = MAZE_SIZE.height;
  }

  async start() {
    const config = this.loadPlayerConfig();
    this.player = new PlayerComponent(config, mazeSpawn.x, mazeSpawn.y);
    this.player.movement.speed = MAZE_SPEED;
    await Promise.all([
      loadImage(this.background, MAZE_BACKGROUND),
      this.player.load()
    ]);
    requestAnimationFrame(time => this.loop(time));
  }

  loadPlayerConfig() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_PLAYER_CONFIG;
    } catch {
      return DEFAULT_PLAYER_CONFIG;
    }
  }

  loop(time) {
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;
    this.update(delta);
    this.draw();
    requestAnimationFrame(next => this.loop(next));
  }

  update(delta) {
    if (this.completed) return;
    const previous = { x: this.player.x, y: this.player.y };
    const input = this.cardinalInput();
    if (input.moving) this.music.play().catch(() => {});
    this.player.x += input.x * MAZE_SPEED * delta;
    this.player.y += input.y * MAZE_SPEED * delta;
    this.player.x = Math.max(mazeBounds.left, Math.min(mazeBounds.right, this.player.x));
    this.player.y = Math.max(mazeBounds.top, Math.min(mazeBounds.bottom, this.player.y));
    this.player.animation.update(delta, input.moving, input.direction);

    if (this.collides(this.feet())) {
      this.player.x = previous.x;
      this.player.y = previous.y;
    }

    if (intersects(this.feet(), treasureZone)) {
      this.completed = true;
      localStorage.setItem("final_sticker", "true");
      this.music.pause();
      this.treasureSound.currentTime = 0;
      this.treasureSound.play().catch(() => {});
      this.completeElement.classList.remove("hidden");
    }
  }

  cardinalInput() {
    const input = this.player.movement.read();
    if (input.x && input.y) {
      if (input.direction === "left" || input.direction === "right") input.y = 0;
      else input.x = 0;
    }
    return input;
  }

  feet() {
    return {
      x: this.player.x + FOOTPRINT.offsetX,
      y: this.player.y + FOOTPRINT.offsetY,
      width: FOOTPRINT.width,
      height: FOOTPRINT.height
    };
  }

  collides(rect) {
    return mazeWalls.some(wall => intersects(rect, wall));
  }

  draw() {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, MAZE_SIZE.width, MAZE_SIZE.height);
    this.ctx.drawImage(this.background, 0, 0, MAZE_SIZE.width, MAZE_SIZE.height);
    this.player.draw(this.ctx);
  }
}

function loadImage(image, src) {
  return new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = src;
  });
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
