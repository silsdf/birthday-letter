export const MAZE_SIZE = {
  width: 1269,
  height: 1239
};

export const mazeSpawn = {
  x: 586,
  y: 1038
};

export const treasureZone = {
  x: 560,
  y: 480,
  width: 150,
  height: 140
};

export const mazeBounds = {
  left: 0,
  top: 0,
  right: MAZE_SIZE.width - 96,
  bottom: MAZE_SIZE.height - 96
};

const SHOT_TO_MAP = MAZE_SIZE.width / 915;

// 按用户标出的蓝框树篱做碰撞：蓝框内不可走，蓝框外可走。
export const mazeWalls = [
  shotWall("top-hedge", 147, 4, 727, 74),
  shotWall("left-edge-hedge", 4, 31, 140, 826),
  shotWall("top-right-block", 689, 83, 209, 78),
  shotWall("top-left-block", 188, 119, 87, 102),
  shotWall("upper-mid-long", 312, 118, 339, 47),
  shotWall("upper-mid-small", 314, 168, 52, 52),
  shotWall("upper-center-block", 394, 197, 95, 58),
  shotWall("upper-right-long", 522, 197, 178, 58),
  shotWall("right-upper-vertical", 751, 164, 135, 134),
  shotWall("left-mid-small", 151, 249, 80, 62),
  shotWall("left-mid-vertical", 252, 257, 64, 88),
  shotWall("middle-left-long", 323, 257, 284, 53),
  shotWall("center-left-vertical", 355, 292, 36, 307),
  shotWall("center-left-tiny", 392, 431, 34, 53),
  shotWall("center-right-vertical", 461, 314, 105, 169),
  shotWall("center-right-tiny", 568, 312, 50, 43),
  shotWall("right-center-vertical", 597, 256, 112, 214),
  shotWall("right-center-small", 712, 343, 52, 57),
  shotWall("right-lower-small", 654, 437, 52, 138),
  shotWall("right-lower-vertical", 741, 432, 62, 263),
  shotWall("far-right-vertical", 807, 316, 89, 384),
  shotWall("left-center-long", 186, 348, 127, 49),
  shotWall("left-lower-horizontal", 152, 436, 87, 44),
  shotWall("left-lower-vertical", 264, 427, 51, 143),
  shotWall("left-lower-small", 188, 526, 75, 35),
  shotWall("left-bottom-vertical", 187, 575, 45, 75),
  shotWall("lower-left-long", 286, 603, 230, 47),
  shotWall("lower-mid-long", 442, 511, 165, 63),
  shotWall("lower-mid-small", 479, 652, 42, 42),
  shotWall("lower-mid-vertical", 561, 578, 55, 78),
  shotWall("lower-right-long", 618, 607, 118, 48),
  shotWall("bottom-left-long", 151, 698, 258, 158),
  shotWall("bottom-right-long", 472, 701, 409, 153)
];

function shotWall(id, x, y, width, height) {
  return {
    id,
    x: x * SHOT_TO_MAP,
    y: y * SHOT_TO_MAP,
    width: width * SHOT_TO_MAP,
    height: height * SHOT_TO_MAP
  };
}
