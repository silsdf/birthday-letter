import { allAchievements, dialogueData } from "./autumn-dialogue-data.js";

const SAVE_KEY = "autumn_visual_novel_progress";
const TYPE_SPEED = 36;

export class AutumnVisualNovelScene {
  constructor(root) {
    this.root = root;
    this.state = {
      phase: "boot",
      lineIndex: 0,
      currentLines: dialogueData.common,
      currentNode: null,
      selectedChoice: null,
      choiceList: null,
      typingDone: false,
      achievement: null
    };
    this.audio = new AutumnAudio(root.querySelector("#windAudio"));
    this.background = new AutumnBackground(root);
    this.achievements = new AchievementPanel(root);
    this.dialogue = new DialogueBox(root, this.state);
    this.sceneStack = [];
    this.onAdvance = this.onAdvance.bind(this);
  }

  async start() {
    this.root.querySelector("#startGate").addEventListener("click", () => this.begin(), { once: true });
    this.root.querySelector("#backButton").addEventListener("click", () => this.goBackScene());
    this.achievements.start();
    this.dialogue.onChoice(choice => this.choose(choice));
    this.root.addEventListener("pointerup", this.onAdvance);
    if (await this.audio.play()) this.begin();
    else this.root.querySelector("#startGate").hidden = false;
  }

  async begin() {
    this.root.querySelector("#startGate").hidden = true;
    await this.audio.play();
    await wait(900);
    this.root.querySelector("#black").classList.add("clear");
    await wait(2600);
    await wait(500);
    this.dialogue.show();
    this.playLines(dialogueData.common);
  }

  playLines(lines) {
    this.state.phase = "dialogue";
    this.state.currentLines = lines;
    this.state.lineIndex = 0;
    this.showCurrentLine();
  }

  async showCurrentLine() {
    const line = this.state.currentLines[this.state.lineIndex];
    if (line.background) await this.changeScene(line.background, {
      lineIndex: Math.max(0, this.state.lineIndex - 1),
      typingDone: true
    });
    this.audio.playLine(line);
    this.dialogue.typeCurrent();
  }

  onAdvance(event) {
    if (event.target.closest(".choice, .top-button, .achievement-panel")) return;
    if (this.state.phase !== "dialogue") return;
    if (!this.state.typingDone) {
      this.dialogue.completeCurrent();
      return;
    }
    this.state.lineIndex += 1;
    if (this.state.lineIndex < this.state.currentLines.length) {
      this.showCurrentLine();
      return;
    }
    if (this.state.currentLines === dialogueData.common) {
      this.dialogue.showChoices(dialogueData.choices);
      return;
    }
    if (this.state.currentNode?.choices) {
      this.dialogue.showChoices(this.state.currentNode.choices);
      return;
    }
    if (this.state.currentNode?.achievement) {
      this.state.achievement = this.state.currentNode.achievement;
      this.achievements.unlock(this.state.achievement);
      this.dialogue.toast(`成就解锁：${this.state.achievement}`);
      setTimeout(() => {
        const next = this.state.currentNode.next;
        if (next) this.playNode(next);
        else this.dialogue.showFinishButton(() => this.finish());
      }, 900);
      return;
    }
    if (this.state.currentNode?.next) {
      this.playNode(this.state.currentNode.next);
      return;
    }
    this.finish();
  }

  async choose(choice) {
    this.state.selectedChoice = choice;
    this.playNode(choice.next);
  }

  async playNode(name) {
    const node = dialogueData.nodes[name];
    this.state.currentNode = node;
    if (node.background) await this.changeScene(node.background);
    if (node.background === "finalTree") this.audio.stopAmbient(0.25);
    if (node.ambient) this.audio.playAmbient(node.ambient);
    this.playLines(node.lines);
  }

  finish() {
    localStorage.setItem("autumn_letter", "true");
    localStorage.setItem("autumn_leaf_sticker", "true");
    localStorage.setItem("autumn_achievement", this.state.achievement);
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      autumn_letter: true,
      autumn_leaf_sticker: true,
      achievement: this.state.achievement
    }));
    this.dialogue.hide();
    this.background.fadeToBlack();
    setTimeout(() => { location.href = "autumn_harvest_scene.html"; }, 900);
  }

  async goBackScene() {
    const snapshot = this.sceneStack.pop();
    if (!snapshot) return;
    this.dialogue.fadeOut();
    await this.background.change(snapshot.background);
    Object.assign(this.state, snapshot.state);
    this.dialogue.restore(snapshot.dialogue);
    this.dialogue.fadeIn();
  }

  async changeScene(name, statePatch = {}) {
    if (this.background.current !== name) this.sceneStack.push(this.snapshot(statePatch));
    this.dialogue.fadeOut();
    await this.background.change(name);
    this.dialogue.fadeIn();
  }

  snapshot(statePatch = {}) {
    return {
      background: this.background.current,
      state: {
        phase: this.state.phase,
        lineIndex: this.state.lineIndex,
        currentLines: this.state.currentLines,
        currentNode: this.state.currentNode,
        selectedChoice: this.state.selectedChoice,
        typingDone: this.state.typingDone,
        achievement: this.state.achievement,
        choiceList: this.state.choiceList,
        ...statePatch
      },
      dialogue: this.dialogue.snapshot()
    };
  }
}

class AchievementPanel {
  constructor(root) {
    this.button = root.querySelector("#achievementButton");
    this.panel = root.querySelector("#achievementPanel");
    this.list = root.querySelector("#achievementList");
  }

  start() {
    this.button.addEventListener("click", () => this.panel.hidden = !this.panel.hidden);
    this.render();
  }

  unlock(name) {
    const unlocked = this.unlocked();
    if (!unlocked.includes(name)) unlocked.push(name);
    localStorage.setItem("autumn_achievements", JSON.stringify(unlocked));
    localStorage.setItem("autumn_achievement", name);
    this.render();
  }

  unlocked() {
    try {
      return JSON.parse(localStorage.getItem("autumn_achievements")) || [];
    } catch {
      return [];
    }
  }

  render() {
    const unlocked = this.unlocked();
    this.list.innerHTML = allAchievements.map(name => `
      <li class="${unlocked.includes(name) ? "on" : ""}">
        <span class="star">★</span><span>${name}</span>
      </li>
    `).join("");
  }
}

class AutumnBackground {
  constructor(root) {
    this.root = root;
    this.black = root.querySelector("#black");
    this.layer = root.querySelector("#backgroundLayer");
    this.current = "opening";
  }

  async change(name) {
    this.current = name;
    this.black.classList.remove("clear");
    await wait(650);
    this.root.dataset.background = name;
    this.layer.dataset.background = name;
    await wait(120);
    this.black.classList.add("clear");
    await wait(900);
  }

  fadeToBlack() {
    this.black.classList.remove("clear");
  }
}

class AutumnAudio {
  constructor(audio) {
    this.audio = audio;
    this.audio.loop = true;
    this.audio.volume = 0.55;
    this.effects = {
      steps: "./assets/autumn-vn/steps-leaves.mp3",
      chew: "./assets/autumn-vn/chew.mp3",
      squirrel: "./assets/autumn-vn/squirrel.mp3",
      touchWater: "./assets/autumn-vn/touch-water.mp3",
      catchFish: "./assets/autumn-vn/catch-fish.mp3",
      fishMiss: "./assets/autumn-vn/fish-miss.mp3"
    };
    this.ambients = {
      stream: "./assets/autumn-vn/stream.mp3"
    };
  }

  async play() {
    try {
      await this.audio.play();
      return true;
    } catch {
      return false;
    }
  }

  playLine(line) {
    if (line.ambientVolume != null && this.ambient) this.ambient.volume = line.ambientVolume;
    if (line.sound) this.playEffect(line.sound);
  }

  playAmbient(name) {
    if (this.ambient?.dataset.name === name) return;
    if (this.ambient) this.ambient.pause();
    this.ambient = new Audio(this.ambients[name]);
    this.ambient.dataset.name = name;
    this.ambient.loop = true;
    this.ambient.volume = 0.35;
    this.ambient.play().catch(() => {});
  }

  stopAmbient(windVolume = 0.55) {
    if (this.ambient) {
      this.ambient.pause();
      this.ambient = null;
    }
    this.audio.volume = windVolume;
    this.audio.play().catch(() => {});
  }

  playEffect(name) {
    const src = this.effects[name];
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.7;
    audio.play().catch(() => {});
  }
}

class DialogueBox {
  constructor(root, state) {
    this.state = state;
    this.box = root.querySelector("#dialogueBox");
    this.name = root.querySelector("#speakerName");
    this.text = root.querySelector("#dialogueText");
    this.choices = root.querySelector("#choices");
    this.toastEl = root.querySelector("#toast");
  }

  show() {
    this.state.phase = "dialogue";
    this.box.hidden = false;
    requestAnimationFrame(() => this.box.classList.add("show"));
  }

  hide() {
    this.state.phase = "reward";
    this.box.classList.remove("show");
    setTimeout(() => { this.box.hidden = true; }, 520);
  }

  fadeOut() {
    this.box.classList.remove("show");
  }

  fadeIn() {
    if (!this.box.hidden) requestAnimationFrame(() => this.box.classList.add("show"));
  }

  typeCurrent() {
    const line = this.state.currentLines[this.state.lineIndex];
    clearInterval(this.timer);
    this.state.typingDone = false;
    this.state.choiceList = null;
    this.name.textContent = line.speaker || "";
    this.name.hidden = !line.speaker;
    this.text.textContent = "";
    this.choices.innerHTML = "";
    let i = 0;
    this.timer = setInterval(() => {
      this.text.textContent = line.text.slice(0, ++i);
      if (i >= line.text.length) {
        clearInterval(this.timer);
        this.state.typingDone = true;
      }
    }, TYPE_SPEED);
  }

  completeCurrent() {
    clearInterval(this.timer);
    this.text.textContent = this.state.currentLines[this.state.lineIndex].text;
    this.state.typingDone = true;
  }

  showChoices(choices) {
    this.state.phase = "choice";
    this.state.choiceList = choices;
    this.choices.innerHTML = "";
    for (const choice of choices) {
      const button = document.createElement("button");
      button.className = "choice";
      button.textContent = choice.text;
      button.addEventListener("click", () => {
        this.choices.innerHTML = "";
        this.choiceHandler(choice);
      });
      this.choices.appendChild(button);
    }
  }

  showFinishButton(handler) {
    this.state.phase = "choice";
    this.state.choiceList = null;
    this.choices.innerHTML = "";
    const button = document.createElement("button");
    button.className = "choice";
    button.textContent = "继续前往下一幕";
    button.addEventListener("click", () => {
      this.choices.innerHTML = "";
      handler();
    }, { once: true });
    this.choices.appendChild(button);
  }

  onChoice(handler) {
    this.choiceHandler = handler;
  }

  toast(message) {
    this.toastEl.textContent = message;
    this.toastEl.classList.add("show");
    setTimeout(() => this.toastEl.classList.remove("show"), 1500);
  }

  snapshot() {
    return {
      speaker: this.name.textContent,
      speakerHidden: this.name.hidden,
      text: this.text.textContent
    };
  }

  restore(snapshot) {
    clearInterval(this.timer);
    this.box.hidden = false;
    this.name.textContent = snapshot.speaker;
    this.name.hidden = snapshot.speakerHidden;
    this.text.textContent = snapshot.text;
    this.choices.innerHTML = "";
    if (this.state.phase === "choice" && this.state.choiceList) {
      this.showChoices(this.state.choiceList);
    }
  }
}

class AutumnReward {
  constructor(root) {
    this.leaf = root.querySelector("#rewardLeaf");
  }

  dropLeaf() {
    this.leaf.hidden = false;
    requestAnimationFrame(() => this.leaf.classList.add("drop"));
  }

  onClaim(handler) {
    this.leaf.addEventListener("click", () => {
      this.leaf.classList.add("claimed");
      handler();
    }, { once: true });
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
