import { assetPath, FRAME_SIZE, SPRITE_GRID } from "../character/sprite-meta.js";

const SOURCE_FRAME_WIDTH = 48;

export class SpriteRenderer {
  constructor(scale = 3) {
    this.scale = scale;
    this.images = new Map();
    this.bodyAnchorCache = new Map();
    this.bodyAnchorCanvas = document.createElement("canvas");
    this.bodyAnchorCanvas.width = SOURCE_FRAME_WIDTH;
    this.bodyAnchorCanvas.height = FRAME_SIZE;
    this.bodyAnchorCtx = this.bodyAnchorCanvas.getContext("2d", { willReadFrequently: true });
    this.layerOffsets = {
      body: { x: 0, y: 0 },
      fitting: { x: 0, y: 0 },
      head: { x: 0, y: 0 }
    };
  }

  async load(config) {
    const entries = [
      ["body", config.body],
      ["head", config.head],
      ["fitting", config.fitting]
    ].filter(([, name]) => name && name !== "none");

    await Promise.all(entries.map(([layer, name]) => this.image(layer, name)));
  }

  async image(layer, name) {
    const key = `${layer}:${name}`;
    if (this.images.has(key)) {
      return this.images.get(key);
    }

    const img = new Image();
    img.src = assetPath(layer, name);
    await img.decode();
    this.images.set(key, img);
    return img;
  }

  draw(ctx, config, pose, x, y, scale = this.scale) {
    const layers = [
      ["body", config.body],
      ["fitting", config.fitting],
      ["head", config.head]
    ];
    const source = this.frameSource(pose);
    const baseAnchor = this.bodyAnchor(config.body, {
      row: SPRITE_GRID.idleRowByDirection[pose.direction],
      column: SPRITE_GRID.frameColumns[0]
    });
    const frameAnchor = this.bodyAnchor(config.body, source);
    const mirrored = SPRITE_GRID.mirroredDirections.has(pose.direction);
    const baseAnchorX = mirrored ? SOURCE_FRAME_WIDTH - baseAnchor.x : baseAnchor.x;
    const frameAnchorX = mirrored ? SOURCE_FRAME_WIDTH - frameAnchor.x : frameAnchor.x;
    const drawX = Math.round(x + (baseAnchorX - frameAnchorX) * scale);
    const drawY = Math.round(y + (baseAnchor.y - frameAnchor.y) * scale);

    for (const [layer, name] of layers) {
      if (!name || name === "none") continue;
      this.drawLayer(ctx, layer, name, source, pose, drawX, drawY, scale);
    }
  }

  frameSource(pose) {
    const rowByDirection = pose.state === "walk"
      ? SPRITE_GRID.walkRowByDirection
      : SPRITE_GRID.idleRowByDirection;

    return {
      column: pose.frameIndex,
      row: rowByDirection[pose.direction]
    };
  }

  bodyAnchor(body, source) {
    const key = `${body}:${source.row}:${source.column}`;
    if (this.bodyAnchorCache.has(key)) {
      return this.bodyAnchorCache.get(key);
    }

    const img = this.images.get(`body:${body}`);
    if (!img) {
      return { x: SOURCE_FRAME_WIDTH / 2, y: FRAME_SIZE - 1 };
    }

    this.bodyAnchorCtx.clearRect(0, 0, SOURCE_FRAME_WIDTH, FRAME_SIZE);
    this.bodyAnchorCtx.drawImage(
      img,
      source.column * SOURCE_FRAME_WIDTH,
      source.row * FRAME_SIZE,
      SOURCE_FRAME_WIDTH,
      FRAME_SIZE,
      0,
      0,
      SOURCE_FRAME_WIDTH,
      FRAME_SIZE
    );

    const pixels = this.bodyAnchorCtx.getImageData(0, 0, SOURCE_FRAME_WIDTH, FRAME_SIZE).data;
    let minX = SOURCE_FRAME_WIDTH;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < FRAME_SIZE; y += 1) {
      for (let x = 0; x < SOURCE_FRAME_WIDTH; x += 1) {
        if (pixels[(y * SOURCE_FRAME_WIDTH + x) * 4 + 3] === 0) continue;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    const anchor = minX === SOURCE_FRAME_WIDTH
      ? { x: SOURCE_FRAME_WIDTH / 2, y: FRAME_SIZE - 1 }
      : { x: (minX + maxX) / 2, y: maxY };
    this.bodyAnchorCache.set(key, anchor);
    return anchor;
  }

  drawLayer(ctx, layer, name, source, pose, x, y, scale) {
    const img = this.images.get(`${layer}:${name}`);
    if (!img) return;

    const sourceColumn = source.column * SOURCE_FRAME_WIDTH;
    const sourceRow = source.row * FRAME_SIZE;
    const width = SOURCE_FRAME_WIDTH * scale;
    const height = FRAME_SIZE * scale;
    const mirrored = SPRITE_GRID.mirroredDirections.has(pose.direction);
    const offset = this.layerOffsets[layer] || { x: 0, y: 0 };
    const drawX = x + offset.x * scale;
    const drawY = y + offset.y * scale;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (mirrored) {
      ctx.translate(drawX + width, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sourceColumn, sourceRow, SOURCE_FRAME_WIDTH, FRAME_SIZE, 0, 0, width, height);
    } else {
      ctx.drawImage(img, sourceColumn, sourceRow, SOURCE_FRAME_WIDTH, FRAME_SIZE, drawX, drawY, width, height);
    }
    ctx.restore();
  }
}
