export const BEDROOM_SIZE = {
  width: 1280,
  height: 1280
};

export const playerSpawn = {
  x: 568,
  y: 1008
};

export const playerBounds = {
  left: 92,
  top: 320,
  right: 1080,
  bottom: 1072
};

export const collisionRects = [
  { id: "topWall", label: "上方墙壁", x: 0, y: 0, width: 1280, height: 318 },
  { id: "leftWall", label: "左侧墙壁边界", x: 0, y: 0, width: 92, height: 1280 },
  { id: "rightWall", label: "右侧墙壁边界", x: 1206, y: 0, width: 74, height: 1280 },
  { id: "bottomLeftWall", label: "底部左墙边界", x: 0, y: 1066, width: 474, height: 214 },
  { id: "bottomRightWall", label: "底部右墙边界", x: 782, y: 1066, width: 498, height: 214 },
  { id: "desk", label: "左侧书桌区域", x: 72, y: 312, width: 330, height: 210 },
  { id: "deskChair", label: "书桌椅子区域", x: 218, y: 420, width: 118, height: 178 },
  { id: "bedsideTable", label: "床头柜区域", x: 754, y: 334, width: 122, height: 158 },
  { id: "bed", label: "右侧床区域", x: 854, y: 268, width: 304, height: 464 },
  { id: "wardrobe", label: "右侧衣柜区域", x: 982, y: 704, width: 174, height: 348 },
  { id: "leftPlant", label: "左下植物区域", x: 68, y: 680, width: 160, height: 196 },
  { id: "luggage", label: "左下行李箱区域", x: 122, y: 848, width: 160, height: 144 }
];

export const interactionZones = [
  {
    id: "deskZone",
    label: "书桌互动区",
    prompt: "整理书桌",
    x: 70,
    y: 270,
    width: 360,
    height: 290
  },
  {
    id: "bedZone",
    label: "床铺互动区",
    prompt: "清洁床铺",
    x: 818,
    y: 250,
    width: 370,
    height: 520
  },
  {
    id: "luggageZone",
    label: "行李互动区",
    prompt: "整理行李",
    x: 104,
    y: 842,
    width: 220,
    height: 164
  },
  {
    id: "exitZone",
    label: "房门出口",
    prompt: "出门",
    x: 480,
    y: 1016,
    width: 318,
    height: 154,
    requiresAllComplete: true
  }
];
