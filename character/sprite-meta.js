export const FRAME_SIZE = 32;
export const STORAGE_KEY = "playerConfiguration";

export const SPRITE_GRID = {
  frameSize: FRAME_SIZE,
  sheetSize: 192,
  columns: 6,
  rows: 6,
  frameColumns: [0, 2, 3, 5],
  idleRowByDirection: {
    down: 0,
    up: 1,
    right: 2,
    left: 2
  },
  walkRowByDirection: {
    down: 3,
    up: 4,
    right: 5,
    left: 5
  },
  mirroredDirections: new Set(["left"]),
  idleFrames: [0],
  walkFrames: [0, 1, 0, 3]
};

export const CHARACTER_ASSETS = {
  body: [
    "ordinary",
    "ordinary_female",
    "venture01",
    "venture02",
    "maid",
    "mantle",
    "armor",
    "skeleton"
  ],
  head: [
    "boy",
    "purple_hair_girl",
    "white_hair_elf",
    "mysterious_man",
    "knight",
    "pumpkin_man",
    "skull",
    "frog"
  ],
  fitting: [
    "none",
    "cloak_red",
    "cloak_blue",
    "cloak_purple"
  ]
};

export const DEFAULT_PLAYER_CONFIG = {
  body: "ordinary",
  head: "boy",
  fitting: "none"
};

export function assetPath(layer, name) {
  return `assets/characters/${layer}/${name}.png`;
}
