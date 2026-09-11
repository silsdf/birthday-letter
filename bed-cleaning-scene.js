const SIZE = 1024;
const VACUUM_START = { x: 620, y: 520 };
const VACUUM_SIZE = { width: 180, height: 138 };
const CLEAN_SPOTS = [
  { x: 220, y: 420, width: 220, height: 180 },
  { x: 460, y: 430, width: 220, height: 190 },
  { x: 590, y: 620, width: 230, height: 170 }
];

export class BedCleaningScene {
  constructor(canvas, progressElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.progressElement = progressElement;
    this.bg = new Image();
    this.vacuum = new Image();
    this.pointer = null;
    this.dragging = false;
    this.cleanSpots = CLEAN_SPOTS.map(() => 0);
    this.particles = [];
    this.completed = false;
    this.lastTime = performance.now();

    this.machine = { ...VACUUM_START };
    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
  }

  async start() {
    await Promise.all([
      loadImage(this.bg, "assets/bed-cleaning/bed-cleaning-bg.png"),
      loadImage(this.vacuum, "assets/bed-cleaning/mite-vacuum.png?v=4")
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
    if (this.dragging && this.pointer) {
      this.machine.x = this.pointer.x - VACUUM_SIZE.width / 2;
      this.machine.y = this.pointer.y - VACUUM_SIZE.height / 2;
      this.cleanUnderVacuum(delta);
      this.spawnDust();
    }

    this.particles = this.particles
      .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - delta }))
      .filter(p => p.life > 0);

    if (!this.completed && this.cleanSpots.every(value => value >= 1)) {
      this.completed = true;
      console.log("[bed-cleaning] bed cleaned");
      this.canvas.dispatchEvent(new CustomEvent("scene-complete", { detail: { task: "bed" } }));
      this.particles.push(...Array.from({ length: 40 }, () => ({
        x: 510 + (Math.random() - 0.5) * 240,
        y: 390 + Math.random() * 180,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3,
        life: 0.9 + Math.random() * 0.5
      })));
    }

    if (this.progressElement) {
      this.progressElement.textContent = this.completed
        ? "床铺已清洁"
        : "长按并拖动除螨仪清洁被子";
    }
  }

  cleanUnderVacuum(delta) {
    CLEAN_SPOTS.forEach((spot, index) => {
      if (intersects(this.vacuumRect(), spot)) {
        this.cleanSpots[index] = Math.min(1, this.cleanSpots[index] + delta * 1.35);
      }
    });
  }

  spawnDust() {
    if (Math.random() > 0.55) return;
    this.particles.push({
      x: this.machine.x + 70 + Math.random() * 40,
      y: this.machine.y + 76 + Math.random() * 26,
      vx: (Math.random() - 0.5) * 3,
      vy: -1 - Math.random() * 2,
      life: 0.35
    });
  }

  progress() {
    return this.cleanSpots.reduce((sum, value) => sum + value, 0) / this.cleanSpots.length;
  }

  pointerDown(event) {
    const point = canvasPoint(this.canvas, event);
    if (!point || !intersects({ x: point.x, y: point.y, width: 1, height: 1 }, this.vacuumRect())) return;
    this.dragging = true;
    this.pointer = point;
    this.canvas.setPointerCapture(event.pointerId);
  }

  pointerMove(event) {
    this.pointer = canvasPoint(this.canvas, event);
  }

  pointerUp() {
    this.dragging = false;
  }

  vacuumRect() {
    return {
      x: this.machine.x,
      y: this.machine.y,
      width: VACUUM_SIZE.width,
      height: VACUUM_SIZE.height
    };
  }

  draw(time) {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, SIZE, SIZE);
    this.ctx.drawImage(this.bg, 0, 0, SIZE, SIZE);
    this.drawDirt();
    this.drawParticles();
    this.drawVacuum(time);
  }

  drawDirt() {
    CLEAN_SPOTS.forEach((spot, index) => {
      const dirt = 1 - this.cleanSpots[index];
      if (dirt <= 0.02) return;
      this.ctx.fillStyle = `rgba(68, 42, 32, ${0.18 * dirt})`;
      this.ctx.fillRect(spot.x + 18, spot.y + 20, spot.width - 36, spot.height - 40);
      this.ctx.fillStyle = `rgba(255, 224, 150, ${0.12 * (1 - dirt)})`;
      this.ctx.fillRect(spot.x + 28, spot.y + 30, spot.width - 56, spot.height - 60);
    });
  }

  drawParticles() {
    for (const p of this.particles) {
      this.ctx.fillStyle = `rgba(255, 238, 176, ${Math.min(1, p.life * 2)})`;
      this.ctx.fillRect(Math.round(p.x), Math.round(p.y), 4, 4);
    }
  }

  drawVacuum(time) {
    const shake = this.dragging ? Math.round(Math.sin(time / 28) * 3) : 0;
    this.ctx.drawImage(this.vacuum, this.machine.x + shake, this.machine.y, VACUUM_SIZE.width, VACUUM_SIZE.height);
  }

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

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
