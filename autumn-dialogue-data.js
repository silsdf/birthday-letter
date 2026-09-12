export const allAchievements = [
  "秋日馈赠",
  "松鼠的邀约",
  "明年见",
  "胆大党",
  "秋膘",
  "减肥",
  "秋礼"
];

export const dialogueData = {
  common: [
    { text: "秋天的森林，世界变得静悄悄" },
    { text: "天气还算晴朗，赶在叶子还没有落完，再多看看秋光吧" }
  ],
  choices: [
    { text: "往森林深处走", next: "forest" },
    { text: "往河流处走", next: "river" },
    { text: "往山上走", next: "mountain" }
  ],
  nodes: {
    forest: {
      background: "forestDeep",
      lines: [
        { text: "越是深处越是静谧" },
        { text: "踩在落满叶子的地上，沙沙作响的声音，似乎打扰到了某个小东西", sound: "steps" },
        { text: "你获得了一个【松果】" },
        { text: "这是秋天的礼物" }
      ],
      choices: [
        { text: "吃掉", next: "forestEat" },
        { text: "放下", next: "forestPut" }
      ]
    },
    forestEat: {
      lines: [
        { text: "这东西有点坚硬，用石头砸碎之后只能吃到零碎的几颗坚果", sound: "chew" },
        { text: "不过依然美味" }
      ],
      achievement: "秋日馈赠",
      next: "finalTree"
    },
    forestPut: {
      lines: [
        { text: "森林里的小家伙也许比我更需要它" },
        { text: "似乎这只小家伙被吸引过来了", background: "squirrel", sound: "squirrel" }
      ],
      achievement: "松鼠的邀约",
      next: "squirrelAfter"
    },
    mountain: {
      background: "forestDeep",
      lines: [
        { text: "越是深处越是静谧" },
        { text: "踩在落满叶子的地上，沙沙作响的声音，似乎打扰到了某个小东西", sound: "steps" },
        { text: "你获得了一个【蘑菇】" },
        { text: "这是秋天的礼物" }
      ],
      choices: [
        { text: "吃掉", next: "mountainEat" },
        { text: "放下", next: "mountainPut" }
      ]
    },
    mountainEat: {
      lines: [
        { text: "吃下去之后感觉有点不适", sound: "chew" }
      ],
      achievement: "胆大党",
      next: "finalTree"
    },
    mountainPut: {
      lines: [
        { text: "森林里的小家伙也许比我更需要它" },
        { text: "似乎这只小家伙被吸引过来了", background: "squirrel", sound: "squirrel" }
      ],
      achievement: "松鼠的邀约",
      next: "squirrelAfter"
    },
    squirrelAfter: {
      lines: [
        { text: "小松鼠在森林里似乎很少见人，仔细地打量了你" },
        { text: "远方传来同类松鼠的叫唤，它一下子又消失了" },
        { text: "秋日也许还是有点短暂" }
      ],
      achievement: "明年见",
      next: "afterAnimal"
    },
    afterAnimal: {
      lines: [
        { text: "告别了小动物，接着继续往前走" }
      ],
      next: "finalTree"
    },
    river: {
      background: "river",
      ambient: "stream",
      lines: [
        { text: "潺潺的流水声，在林间深处尤为喧哗" },
        { text: "你伸手往河水里探了探", ambientVolume: 0.18, sound: "touchWater" },
        { text: "秋日的水还不算太冷，隐约还可以看到远处鱼儿游动", ambientVolume: 0.35, background: "fish" }
      ],
      choices: [
        { text: "抓鱼", next: "catchFish" },
        { text: "逗鱼", next: "teaseFish" }
      ]
    },
    catchFish: {
      lines: [
        { text: "你一口气跳进河里，最大的那条鱼似乎今日必落你手中", sound: "catchFish" },
        { text: "你等了一段时间，想抓住前方那只似乎没注意你的大鱼" },
        { text: "秋天的鱼虽然肥美，但也圆滚得难抓", sound: "fishMiss" }
      ],
      achievement: "秋膘",
      next: "afterRiver"
    },
    teaseFish: {
      lines: [
        { text: "你看着这群秋鱼悠然自得，不由地想要使点坏心思" },
        { text: "从包里拿出一块面包，轻轻洒在水面上" },
        { text: "这群贪婪的鱼，最后还是上钩了" },
        { text: "你拿走了水面上的面包屑，看着它们只得一场空" }
      ],
      achievement: "减肥",
      next: "afterRiver"
    },
    afterRiver: {
      lines: [
        { text: "听完了流水的奏乐，继续前进" }
      ],
      next: "finalTree"
    },
    finalTree: {
      background: "finalTree",
      lines: [
        { text: "相传这里就是森林的终点" },
        { text: "眼前这颗，似乎就是森林里最特别的树" },
        { text: "小时候曾听大人说过" },
        { text: "万物有灵，如果对着这颗树许愿，梦想就会成真" },
        { text: "你的手轻抚它百年的褶皱，它似乎和别的树没什么不同，但冥冥之中又感到如此的熟悉" },
        { text: "也许你也曾在这里许愿过" }
      ],
      choices: [
        { text: "许下心愿", next: "wish" }
      ]
    },
    wish: {
      lines: [
        { text: "落叶纷纷里，你得到了秋天的祝福。【获得秋叶贴纸一枚】" }
      ],
      achievement: "秋礼"
    }
  },
  ending: [
    { text: "PLACEHOLDER_ENDING_01" },
    { text: "PLACEHOLDER_ENDING_02" }
  ]
};
