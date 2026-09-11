const SIZE = 1024;
const SUITCASE = { x: 92, y: 118, width: 840, height: 690 };
const ITEM_ASSETS = {
  shirt: "assets/luggage-packing/cloth-white-upright.png?v=2",
  pants: "assets/luggage-packing/cloth-gray-upright.png?v=2",
  coat: "assets/luggage-packing/cloth-red-upright.png?v=2",
  sockA: "assets/luggage-packing/sock-white-red.png?v=2",
  sockB: "assets/luggage-packing/sock-red.png?v=2",
  resume: "assets/luggage-packing/resume-horizontal.png?v=2",
  toothbrush: "assets/luggage-packing/toothbrush.png?v=2",
  toothpaste: "assets/luggage-packing/toothpaste.png?v=2"
};

const SLOTS = [
  { id: "shirt", label: "衣服", x: 128, y: 206, width: 128, height: 128 },
  { id: "pants", label: "衣服", x: 284, y: 206, width: 128, height: 128 },
  { id: "coat", label: "衣服", x: 206, y: 382, width: 128, height: 128 },
  { id: "sockA", label: "袜子", x: 146, y: 562, width: 96, height: 96 },
  { id: "sockB", label: "袜子", x: 286, y: 562, width: 96, height: 96 },
  { id: "resume", label: "简历", x: 540, y: 218, width: 144, height: 96 },
  { id: "toothbrush", label: "牙刷", x: 554, y: 414, width: 58, height: 116 },
  { id: "toothpaste", label: "牙膏", x: 716, y: 414, width: 58, height: 116 }
];

const STARTS = [
  { id: "shirt", x: 46, y: 818, width: 112, height: 112 },
  { id: "pants", x: 168, y: 818, width: 112, height: 112 },
  { id: "coat", x: 290, y: 818, width: 112, height: 112 },
  { id: "resume", x: 420, y: 830, width: 132, height: 88 },
  { id: "toothbrush", x: 580, y: 798, width: 58, height: 116 },
  { id: "toothpaste", x: 654, y: 798, width: 58, height: 116 },
  { id: "sockA", x: 762, y: 828, width: 96, height: 96 },
  { id: "sockB", x: 874, y: 828, width: 96, height: 96 }
];

export class LuggagePackingScene {
  constructor(canvas, hintElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hintElement = hintElement;
    this.pointer = null;
    this.dragged = null;
    this.completed = false;
    this.completePulse = 0;
    this.images = {};
    this.items = STARTS.map(item => ({ ...item, homeX: item.x, homeY: item.y, placed: false, bounce: 0 }));
    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
  }

  async start() {
    await this.loadImages();
    this.canvas.addEventListener("pointerdown", event => this.pointerDown(event));
    this.canvas.addEventListener("pointermove", event => this.pointerMove(event));
    window.addEventListener("pointerup", () => this.pointerUp());
    requestAnimationFrame(time => this.loop(time));
  }

  async loadImages() {
    await Promise.all(Object.entries(ITEM_ASSETS).map(([id, src]) => {
      const image = new Image();
      this.images[id] = image;
      return loadImage(image, src);
    }));
  }

  loop(time) {
    this.update();
    this.draw(time);
    requestAnimationFrame(next => this.loop(next));
  }

  update() {
    if (this.dragged && this.pointer) {
      this.dragged.x += (this.pointer.x - this.dragged.width / 2 - this.dragged.x) * 0.44;
      this.dragged.y += (this.pointer.y - this.dragged.height / 2 - this.dragged.y) * 0.44;
    }
    for (const item of this.items) item.bounce *= 0.82;
    if (this.completed) this.completePulse += 0.04;
    this.hintElement.textContent = this.completed ? "行李箱整理完成" : "拖动物品，放进对应凹槽";
  }

  pointerDown(event) {
    this.pointer = canvasPoint(this.canvas, event);
    this.dragged = this.items
      .filter(item => !item.placed)
      .reverse()
      .find(item => intersects(pointRect(this.pointer), item)) || null;
    if (!this.dragged) return;
    this.dragged.grabbed = true;
    this.canvas.setPointerCapture(event.pointerId);
  }

  pointerMove(event) {
    this.pointer = canvasPoint(this.canvas, event);
  }

  pointerUp() {
    if (!this.dragged) return;
    const slot = SLOTS.find(target => target.id === this.dragged.id);
    if (slot && closeToCenter(this.dragged, slot, 78)) {
      this.dragged.x = slot.x + (slot.width - this.dragged.width) / 2;
      this.dragged.y = slot.y + (slot.height - this.dragged.height) / 2;
      this.dragged.placed = true;
      this.dragged.bounce = 10;
      this.playBlip(520);
    } else {
      this.dragged.x = this.dragged.homeX;
      this.dragged.y = this.dragged.homeY;
    }
    this.dragged.grabbed = false;
    this.dragged = null;
    this.pointer = null;
    if (!this.completed && this.items.every(item => item.placed)) {
      this.completed = true;
      this.playBlip(760);
      console.log("[luggage-packing] luggage packed");
      this.canvas.dispatchEvent(new CustomEvent("scene-complete", { detail: { task: "luggage" } }));
    }
  }

  playBlip(freq) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audio = this.audio || (this.audio = new AudioContext());
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.value = freq;
    osc.type = "square";
    gain.gain.setValueAtTime(0.035, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.08);
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.08);
  }

  draw(time) {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, SIZE, SIZE);
    drawRoom(this.ctx);
    drawSuitcase(this.ctx);
    for (const slot of SLOTS) this.drawSlot(slot);
    this.items.filter(item => item.placed).forEach(item => this.drawItem(item, time));
    this.items.filter(item => !item.placed && item !== this.dragged).forEach(item => this.drawItem(item, time));
    if (this.dragged) this.drawItem(this.dragged, time);
  }

  drawSlot(slot) {
    const active = this.dragged?.id === slot.id && closeToCenter(this.dragged, slot, 98);
    this.ctx.save();
    this.ctx.translate(slot.x, slot.y);
    this.ctx.globalAlpha = active ? 0.55 : 0.3;
    this.ctx.filter = active ? "brightness(1.45)" : "none";
    this.drawSprite({ id: slot.id, width: slot.width, height: slot.height, ghost: true });
    this.ctx.restore();
    if (active) {
      this.ctx.strokeStyle = "#ffe28a";
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(slot.x - 8, slot.y - 8, slot.width + 16, slot.height + 16);
    }
  }

  drawItem(item, time) {
    const lift = item.grabbed ? 12 : Math.round(item.bounce);
    this.ctx.save();
    this.ctx.translate(Math.round(item.x), Math.round(item.y - lift));
    if (item.grabbed) this.ctx.scale(1.06, 1.06);
    this.drawSprite(item);
    this.ctx.restore();
  }

  drawSprite(item) {
    const image = this.images[item.id];
    if (!image) return drawItemSprite(this.ctx, item);
    this.ctx.save();
    if (item.ghost) {
      this.ctx.globalAlpha = 0.34;
      this.ctx.filter = "brightness(0.45) sepia(0.5)";
    }
    this.ctx.drawImage(image, 0, 0, item.width, item.height);
    this.ctx.restore();
  }
}

function drawRoom(ctx) {
  ctx.fillStyle = "#7a4528";
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let y = 0; y < SIZE; y += 64) {
    ctx.fillStyle = y % 128 ? "#c88443" : "#d9964f";
    ctx.fillRect(0, y, SIZE, 64);
    ctx.fillStyle = "rgba(80,38,18,0.26)";
    ctx.fillRect(0, y + 60, SIZE, 4);
  }
  for (let x = 0; x < SIZE; x += 96) {
    ctx.fillStyle = "rgba(92,45,20,0.28)";
    ctx.fillRect(x, 0, 5, SIZE);
  }
  ctx.fillStyle = "rgba(255,205,98,0.18)";
  ctx.fillRect(130, 60, 520, 100);
  ctx.fillRect(220, 70, 330, 24);
}

function drawSuitcase(ctx) {
  const s = SUITCASE;
  pixelRoundRect(ctx, s.x - 26, s.y - 26, s.width + 52, s.height + 52, 28, "#2a140d");
  pixelRoundRect(ctx, s.x - 8, s.y - 8, s.width + 16, s.height + 16, 22, "#6b341d");
  pixelRoundRect(ctx, s.x, s.y, s.width, s.height, 18, "#ad6834");
  ctx.fillStyle = "#c8894f";
  ctx.fillRect(s.x + 38, s.y + 44, s.width - 76, s.height - 88);
  ctx.fillStyle = "#8e4d27";
  ctx.fillRect(s.x + 410, s.y + 20, 24, s.height - 40);
  ctx.fillStyle = "#5f2b18";
  ctx.fillRect(s.x + 418, s.y + 40, 8, s.height - 80);
  ctx.fillStyle = "#f1c07a";
  ctx.fillRect(s.x + 62, s.y + 70, 276, 14);
  ctx.fillRect(s.x + 492, s.y + 70, 288, 14);
  for (let y = s.y + 118; y < s.y + s.height - 70; y += 44) {
    ctx.fillStyle = "rgba(95,49,24,0.20)";
    ctx.fillRect(s.x + 46, y, s.width - 92, 6);
  }
  ctx.fillStyle = "#3b1c12";
  ctx.fillRect(s.x + 340, s.y - 64, 160, 28);
  ctx.fillStyle = "#ba743b";
  ctx.fillRect(s.x + 366, s.y - 54, 108, 12);
}

function drawItemSprite(ctx, item) {
  if (item.ghost) return drawSlotSilhouette(ctx, item);
  if (item.id === "resume") return drawResume(ctx, item.width, item.height);
  if (item.id === "toothbrush") return drawToothbrush(ctx, item.width, item.height);
  if (item.id === "toothpaste") return drawToothpaste(ctx, item.width, item.height);
  if (item.id.startsWith("sock")) return drawSock(ctx, item.width, item.height, item.id === "sockA" ? "#efe7d5" : "#ffd8b6");
  const colors = {
    shirt: ["#355f9a", "#5f91d6"],
    pants: ["#6e8f3d", "#a6c96a"],
    coat: ["#8b4d8f", "#c783c8"]
  }[item.id];
  drawClothes(ctx, item.width, item.height, colors);
}

function drawSlotSilhouette(ctx, item) {
  ctx.fillStyle = "#4f2b1c";
  if (item.id === "resume") return pixelRoundRect(ctx, 0, 0, item.width, item.height, 6);
  if (item.id === "toothbrush") {
    ctx.fillRect(8, item.height / 2 - 6, item.width - 48, 12);
    ctx.fillRect(item.width - 48, item.height / 2 - 18, 38, 32);
    return;
  }
  if (item.id === "toothpaste") return pixelRoundRect(ctx, 0, 6, item.width, item.height - 12, 8);
  if (item.id.startsWith("sock")) {
    ctx.fillRect(14, 4, 36, item.height - 20);
    ctx.fillRect(28, item.height - 28, item.width - 30, 24);
    return;
  }
  drawClothes(ctx, item.width, item.height, ["#4f2b1c", "#613720"]);
}

function drawClothes(ctx, w, h, [dark, light]) {
  ctx.fillStyle = "#24140d";
  ctx.fillRect(14, 20, w - 28, h - 18);
  ctx.fillRect(0, 34, 24, h - 38);
  ctx.fillRect(w - 24, 34, 24, h - 38);
  ctx.fillStyle = dark;
  ctx.fillRect(18, 20, w - 36, h - 24);
  ctx.fillRect(4, 38, 28, h - 46);
  ctx.fillRect(w - 32, 38, 28, h - 46);
  ctx.fillStyle = light;
  ctx.fillRect(30, 30, w - 60, 18);
  ctx.fillRect(38, 58, w - 76, 16);
  ctx.fillStyle = "#f4cf96";
  ctx.fillRect(w / 2 - 18, 20, 36, 14);
}

function drawResume(ctx, w, h) {
  ctx.fillStyle = "#2b1a12";
  ctx.fillRect(8, 8, w - 8, h - 8);
  ctx.fillStyle = "#f3ead3";
  ctx.fillRect(0, 0, w - 10, h - 12);
  ctx.fillStyle = "#c98646";
  ctx.fillRect(16, 20, 70, 8);
  ctx.fillStyle = "#7f9fc7";
  ctx.fillRect(16, 44, w - 46, 8);
  ctx.fillRect(16, 66, w - 68, 8);
  ctx.fillRect(16, 88, w - 58, 8);
}

function drawToothbrush(ctx, w, h) {
  ctx.fillStyle = "#26150e";
  ctx.fillRect(4, h / 2 - 6, w - 18, 12);
  ctx.fillStyle = "#56a7c9";
  ctx.fillRect(10, h / 2 - 4, w - 44, 8);
  ctx.fillStyle = "#f4eee0";
  ctx.fillRect(w - 44, h / 2 - 16, 34, 30);
  ctx.fillStyle = "#9ed9e6";
  ctx.fillRect(w - 38, h / 2 - 22, 8, 12);
  ctx.fillRect(w - 24, h / 2 - 22, 8, 12);
}

function drawToothpaste(ctx, w, h) {
  ctx.fillStyle = "#25140d";
  ctx.fillRect(8, 8, w - 16, h - 16);
  ctx.fillStyle = "#e9f3ef";
  ctx.fillRect(14, 10, w - 36, h - 20);
  ctx.fillStyle = "#67b7d0";
  ctx.fillRect(30, 20, w - 80, 12);
  ctx.fillStyle = "#d96649";
  ctx.fillRect(w - 36, 12, 20, h - 24);
}

function drawSock(ctx, w, h, color) {
  ctx.fillStyle = "#25140d";
  ctx.fillRect(16, 8, 34, h - 22);
  ctx.fillRect(30, h - 30, w - 34, 24);
  ctx.fillStyle = color;
  ctx.fillRect(20, 10, 28, h - 28);
  ctx.fillRect(32, h - 28, w - 42, 18);
  ctx.fillStyle = "#b45c47";
  ctx.fillRect(20, 12, 28, 10);
}

function pixelRoundRect(ctx, x, y, w, h, r, fillStyle) {
  if (fillStyle) ctx.fillStyle = fillStyle;
  ctx.fillRect(x + r, y, w - r * 2, h);
  ctx.fillRect(x, y + r, w, h - r * 2);
  ctx.fillRect(x + r / 2, y + r / 2, w - r, h - r);
}

function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * SIZE,
    y: ((event.clientY - rect.top) / rect.height) * SIZE
  };
}

function loadImage(image, src) {
  return new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = src;
  });
}

function pointRect(point) {
  return { x: point.x, y: point.y, width: 1, height: 1 };
}

function center(rect) {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

function closeToCenter(a, b, distance) {
  const ac = center(a);
  const bc = center(b);
  return Math.hypot(ac.x - bc.x, ac.y - bc.y) < distance;
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
