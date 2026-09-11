import {
  CHARACTER_ASSETS,
  DEFAULT_PLAYER_CONFIG,
  STORAGE_KEY
} from "./sprite-meta.js";
import { SpriteRenderer } from "../player/sprite-renderer.js";

const LABELS = {
  body: "服装",
  fitting: "披风",
  ordinary: "日常装1",
  ordinary_female: "日常装2",
  venture01: "冒险装一",
  venture02: "冒险装二",
  maid: "仆人装",
  mantle: "披肩",
  armor: "盔甲",
  skeleton: "骷髅身体",
  none: "无",
  cloak_red: "红色披风",
  cloak_blue: "蓝色披风",
  cloak_purple: "紫色披风",
  boy: "少年",
  purple_hair_girl: "紫发女孩",
  white_hair_elf: "白发精灵",
  mysterious_man: "神秘人",
  knight: "骑士",
  pumpkin_man: "南瓜人",
  skull: "骷髅头",
  frog: "青蛙"
};

export class CharacterSelect {
  constructor(root) {
    this.root = root;
    this.config = this.loadSavedConfig();
    this.renderer = new SpriteRenderer(5);
    this.pose = { direction: "down", state: "idle", frameIndex: 0 };
  }

  async start() {
    this.renderControls();
    await this.reload();
  }

  loadSavedConfig() {
    try {
      return {
        ...DEFAULT_PLAYER_CONFIG,
        ...JSON.parse(localStorage.getItem(STORAGE_KEY))
      };
    } catch {
      return { ...DEFAULT_PLAYER_CONFIG };
    }
  }

  renderControls() {
    this.root.innerHTML = `
      <section class="panel">
        <h1>选择角色</h1>
        <canvas id="characterPreview" width="288" height="208"></canvas>
        <div class="controls">
          <label>${LABELS.body} <select id="bodySelect"></select></label>
          <label>${LABELS.fitting} <select id="fittingSelect"></select></label>
        </div>
        <div class="headGrid" id="headGrid"></div>
        <button id="confirmCharacter">确认角色</button>
      </section>
    `;

    this.preview = this.root.querySelector("#characterPreview");
    this.previewCtx = this.preview.getContext("2d");
    this.fillSelect("bodySelect", CHARACTER_ASSETS.body, this.config.body);
    this.fillSelect("fittingSelect", CHARACTER_ASSETS.fitting, this.config.fitting);
    this.fillHeads();

    this.root.querySelector("#bodySelect").addEventListener("change", event => {
      this.config.body = event.target.value;
      this.reload();
    });
    this.root.querySelector("#fittingSelect").addEventListener("change", event => {
      this.config.fitting = event.target.value;
      this.reload();
    });
    this.root.querySelector("#confirmCharacter").addEventListener("click", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      this.root.dispatchEvent(new CustomEvent("character-confirmed", { detail: this.config }));
    });
  }

  fillSelect(id, options, selected) {
    const select = this.root.querySelector(`#${id}`);
    select.innerHTML = options.map(name => (
      `<option value="${name}" ${name === selected ? "selected" : ""}>${LABELS[name] || name}</option>`
    )).join("");
  }

  fillHeads() {
    const grid = this.root.querySelector("#headGrid");
    grid.innerHTML = "";

    for (const head of CHARACTER_ASSETS.head) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = LABELS[head] || head;
      button.className = head === this.config.head ? "selected" : "";
      button.addEventListener("click", () => {
        this.config.head = head;
        this.fillHeads();
        this.reload();
      });
      grid.append(button);
    }
  }

  async reload() {
    await this.renderer.load(this.config);
    this.drawPreview();
  }

  drawPreview() {
    if (!this.previewCtx) return;
    this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height);
    this.previewCtx.imageSmoothingEnabled = false;
    this.renderer.draw(this.previewCtx, this.config, this.pose, 24, 24, 5);
  }
}
