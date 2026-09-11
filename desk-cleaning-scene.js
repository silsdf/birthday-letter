const SIZE = 1024;
const DESK = { x: 94, y: 390, width: 720, height: 230 };
const BIN = { x: 800, y: 720, width: 150, height: 190 };
const PLANT = { x: 94, y: 300, width: 190, height: 210 };
const CAN_START = { x: 690, y: 514, width: 126, height: 88 };

export class DeskCleaningScene {
  constructor(canvas, hintElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hintElement = hintElement;
    this.bg = new Image();
    this.paperImage = new Image();
    this.trashSound = new Audio("assets/desk-cleaning/trash-drop.mp3");
    this.wateringSound = new Audio("assets/desk-cleaning/watering.mp3");
    this.wateringSound.loop = true;
    this.wateringSound.volume = 0;
    this.audioUnlocked = false;
    this.pointer = null;
    this.dragged = null;
    this.binOpen = 0;
    this.binShake = 0;
    this.water = 0;
    this.completed = false;
    this.particles = [];
    this.lastTime = performance.now();
    this.trash = shuffle([
      trash("paper1", 210, 430),
      trash("paper2", 480, 456),
      trash("paper3", 704, 446)
    ]);
    this.can = { ...CAN_START, kind: "can" };

    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
  }

  async start() {
    await Promise.all([
      loadImage(this.bg, "assets/desk-cleaning/desk-cleaning-bg.png"),
      loadImage(this.paperImage, "assets/desk-cleaning/crumpled-paper.png")
    ]);
    this.canvas.addEventListener("pointerdown", event => this.pointerDown(event));
    this.canvas.addEventListener("pointermove", event => this.pointerMove(event));
    window.addEventListener("pointerup", () => this.pointerUp());
    requestAnimationFrame(time => this.loop(time));
  }

  loop(time) {
    const delta = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    this.update(delta);
    this.draw(time);
    requestAnimationFrame(next => this.loop(next));
  }

  update(delta) {
    const nearBin = this.dragged?.kind === "trash" && intersects(this.dragged, expand(BIN, 42));
    this.binOpen += ((nearBin ? 1 : 0) - this.binOpen) * 0.25;
    this.binShake *= 0.82;

    if (this.dragged && this.pointer) {
      this.dragged.x += (this.pointer.x - this.dragged.width / 2 - this.dragged.x) * 0.42;
      this.dragged.y += (this.pointer.y - this.dragged.height / 2 - this.dragged.y) * 0.42;
    }

    if (this.trash.every(item => item.gone) && this.dragged === this.can && intersects(this.canSpout(), PLANT)) {
      this.water = Math.min(1, this.water + delta * 0.7);
      this.wateringSound.volume = 0.55;
      this.wateringSound.play().catch(() => {});
      this.spawnWater();
    } else {
      this.wateringSound.pause();
      this.wateringSound.currentTime = 0;
    }

    this.particles = this.particles
      .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - delta }))
      .filter(p => p.life > 0);

    if (!this.completed && this.trash.every(item => item.gone) && this.water >= 1) {
      this.completed = true;
      this.wateringSound.pause();
      this.wateringSound.currentTime = 0;
      console.log("[desk-cleaning] desk cleaned");
      this.canvas.dispatchEvent(new CustomEvent("scene-complete", { detail: { task: "desk" } }));
    }

    this.hintElement.textContent = this.completed
      ? "桌面整理完成"
      : this.trash.some(item => !item.gone)
        ? "长按纸团，拖进垃圾桶"
        : "拖动喷壶给植物浇水";
  }

  pointerDown(event) {
    this.unlockAudio();
    this.pointer = canvasPoint(this.canvas, event);
    this.dragged = [...this.trash.filter(item => !item.gone), this.can]
      .reverse()
      .find(item => intersects(pointRect(this.pointer), item)) || null;
    if (!this.dragged || (this.dragged.kind === "can" && this.trash.some(item => !item.gone))) {
      this.dragged = null;
      return;
    }
    this.dragged.grabbed = true;
    this.canvas.setPointerCapture(event.pointerId);
  }

  unlockAudio() {
    if (this.audioUnlocked) return;
    this.audioUnlocked = true;
    for (const audio of [this.trashSound, this.wateringSound]) {
      audio.muted = true;
      audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        })
        .catch(() => { audio.muted = false; });
    }
  }

  pointerMove(event) {
    this.pointer = canvasPoint(this.canvas, event);
  }

  pointerUp() {
    if (this.dragged?.kind === "trash") {
      if (intersects(this.dragged, BIN)) {
        this.dragged.gone = true;
        this.binShake = 8;
        playOnce(this.trashSound);
        this.spawnPaperDrop(this.dragged.x, this.dragged.y);
      } else {
        this.dragged.x = this.dragged.homeX;
        this.dragged.y = this.dragged.homeY;
      }
    }
    if (this.dragged) this.dragged.grabbed = false;
    this.dragged = null;
    this.pointer = null;
  }

  spawnPaperDrop(x, y) {
    this.particles.push(...Array.from({ length: 8 }, () => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 5,
      vy: -2 - Math.random() * 3,
      life: 0.35
    })));
  }

  spawnWater() {
    const spout = this.canSpout();
    this.particles.push(...Array.from({ length: 4 }, () => ({
      x: spout.x + Math.random() * spout.width,
      y: spout.y + Math.random() * spout.height,
      vx: -2 - Math.random() * 3,
      vy: 2 + Math.random() * 4,
      life: 0.45
    })));
  }

  canSpout() {
    return {
      x: this.can.x,
      y: this.can.y + 28,
      width: 36,
      height: 28
    };
  }

  draw(time) {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, SIZE, SIZE);
    this.ctx.drawImage(this.bg, 0, 0, SIZE, SIZE);
    this.drawPlant(time);
    this.drawBin();
    this.trash.filter(item => !item.gone && item !== this.dragged).forEach(item => this.drawTrash(item));
    if (this.trash.every(item => item.gone)) this.drawCan(this.can);
    if (this.dragged?.kind === "trash") this.drawTrash(this.dragged);
    if (this.dragged === this.can) this.drawCan(this.can);
    this.drawParticles();
  }

  drawPlant(time) {
    const sway = this.water > 0 ? Math.round(Math.sin(time / 120) * 3 * this.water) : 0;
    this.ctx.fillStyle = `rgba(71, 38, 18, ${0.28 + this.water * 0.2})`;
    this.ctx.fillRect(150, 448, 62, 20);
    this.ctx.fillStyle = `rgba(90, 186, 74, ${0.16 * this.water})`;
    this.ctx.fillRect(108 + sway, 316, 150, 120);
  }

  drawTrash(item) {
    const scale = item.grabbed ? 1.12 : 1;
    const w = item.width * scale;
    const h = item.height * scale;
    const x = item.x - (w - item.width) / 2;
    const y = item.y - (h - item.height) / 2 - (item.grabbed ? 10 : 0);
    this.ctx.drawImage(this.paperImage, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  drawBin() {
    const open = this.binOpen;
    const shake = Math.round(Math.sin(performance.now() / 30) * this.binShake);
    const x = BIN.x + shake;
    const y = BIN.y;
    this.ctx.fillStyle = "#101820";
    this.ctx.fillRect(x + 26, y + 54, BIN.width - 52, BIN.height - 70);
    this.ctx.fillRect(x + 18, y + 38 - open * 30, BIN.width - 36, 22);
    this.ctx.fillRect(x + 52, y + 18 - open * 30, BIN.width - 104, 10);
    this.ctx.fillStyle = "#8fa0aa";
    this.ctx.fillRect(x + 34, y + 62, BIN.width - 68, BIN.height - 92);
    this.ctx.fillStyle = "#aebbc3";
    this.ctx.fillRect(x + 26, y + 42 - open * 30, BIN.width - 52, 22);
    this.ctx.fillStyle = "#627783";
    for (let stripe = x + 46; stripe < x + BIN.width - 42; stripe += 20) {
      this.ctx.fillRect(stripe, y + 78, 8, BIN.height - 124);
    }
    this.ctx.fillStyle = "#d8e0e4";
    this.ctx.fillRect(x + 38, y + 46 - open * 30, BIN.width - 76, 6);
  }

  drawCan(item) {
    const x = item.x;
    const y = item.y;
    this.ctx.fillStyle = "#3a2117";
    this.ctx.fillRect(x + 30, y + 16, 58, 58);
    this.ctx.fillRect(x + 84, y + 36, 34, 14);
    this.ctx.fillRect(x + 10, y + 42, 28, 10);
    this.ctx.fillRect(x + 52, y + 4, 18, 24);
    this.ctx.fillStyle = "#b85f25";
    this.ctx.fillRect(x + 34, y + 18, 50, 54);
    this.ctx.fillStyle = "#d9792e";
    this.ctx.fillRect(x + 40, y + 22, 34, 44);
    this.ctx.fillStyle = "#f0a14b";
    this.ctx.fillRect(x + 50, y + 28, 10, 28);
    this.ctx.fillStyle = "#8f431c";
    this.ctx.fillRect(x + 16, y + 44, 24, 6);
    this.ctx.fillRect(x + 84, y + 38, 28, 8);
    this.ctx.fillStyle = "#d9792e";
    this.ctx.fillRect(x + 54, y + 8, 12, 20);
    this.ctx.fillRect(x + 92, y + 32, 14, 8);
  }

  drawParticles() {
    for (const p of this.particles) {
      this.ctx.fillStyle = p.vy > 0
        ? `rgba(120, 210, 255, ${Math.min(1, p.life * 3)})`
        : `rgba(255, 230, 160, ${Math.min(1, p.life * 3)})`;
      this.ctx.fillRect(Math.round(p.x), Math.round(p.y), 4, p.vy > 0 ? 8 : 4);
    }
  }

}

function trash(id, x, y) {
  return { id, kind: "trash", x, y, homeX: x, homeY: y, width: 88, height: 88, grabbed: false, gone: false };
}

function playOnce(audio) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function shuffle(list) {
  return list.sort(() => Math.random() - 0.5);
}

function loadImage(image, src) {
  return new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = src;
  });
}

function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * SIZE,
    y: ((event.clientY - rect.top) / rect.height) * SIZE
  };
}

function pointRect(point) {
  return { x: point.x, y: point.y, width: 1, height: 1 };
}

function expand(rect, amount) {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2
  };
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
