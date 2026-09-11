# 房间素材库 · room-assets

> 由 `build_room_assets.py` 生成。尺寸为**裁切掉透明留白后的实际占用区**。
> `floor_contact_anchor` 通过 alpha 计算（物体与地面接触带），**不是 bbox 中心**。

## furniture (20)

| 文件 | 名称 | 尺寸px | 建议显示 | 落地锚点(x%,y%) | 地面 | 墙面 | 桌面 |
|---|---|---|---|---|---|---|---|
| `furniture/bed_v1.png` | bed_v1 | 54×47 | 108×94 | 61.1%,97.9% | ✓ |  |  |
| `furniture/bed_v2.png` | bed_v2 | 54×47 | 108×94 | 37.0%,97.9% | ✓ |  |  |
| `furniture/bed_v3.png` | bed_v3 | 54×41 | 108×82 | 38.0%,97.6% | ✓ |  |  |
| `furniture/bed_v4.png` | bed_v4 | 54×41 | 108×82 | 60.2%,97.6% | ✓ |  |  |
| `furniture/desk_v1.png` | desk_v1 | 72×61 | 144×122 | 30.6%,98.4% | ✓ |  |  |
| `furniture/desk_v2.png` | desk_v2 | 72×61 | 144×122 | 68.1%,98.4% | ✓ |  |  |
| `furniture/desk_v3.png` | desk_v3 | 72×61 | 144×122 | 68.1%,98.4% | ✓ |  |  |
| `furniture/desk_v4.png` | desk_v4 | 72×61 | 144×122 | 30.6%,98.4% | ✓ |  |  |
| `furniture/chair_v1.png` | chair_v1 | 26×49 | 52×98 | 35.8%,98.0% | ✓ |  |  |
| `furniture/chair_v2.png` | chair_v2 | 26×49 | 52×98 | 62.7%,98.0% | ✓ |  |  |
| `furniture/chair_v3.png` | chair_v3 | 27×43 | 54×86 | 53.0%,97.7% | ✓ |  |  |
| `furniture/chair_v4.png` | chair_v4 | 27×43 | 54×86 | 43.3%,97.7% | ✓ |  |  |
| `furniture/wardrobe_v1.png` | wardrobe_v1 | 31×62 | 62×124 | 61.3%,98.4% | ✓ |  |  |
| `furniture/wardrobe_v2.png` | wardrobe_v2 | 31×61 | 62×122 | 35.5%,98.4% | ✓ |  |  |
| `furniture/wardrobe_v3.png` | wardrobe_v3 | 31×61 | 62×122 | 61.3%,98.4% | ✓ |  |  |
| `furniture/wardrobe_v4.png` | wardrobe_v4 | 31×61 | 62×122 | 35.5%,98.4% | ✓ |  |  |
| `furniture/plant.png` | plant | 19×40 | 38×80 | 52.6%,97.5% | ✓ |  |  |
| `furniture/cabinet_pp.png` | cabinet_pp | 28×38 | 56×76 | 48.2%,97.4% | ✓ |  |  |
| `furniture/bed_pp.png` | bed_pp | 23×36 | 46×72 | 47.8%,97.2% | ✓ |  |  |
| `furniture/sofa_pp.png` | sofa_pp | 40×22 | 80×44 | 48.8%,95.5% | ✓ |  |  |

## environment (8)

| 文件 | 名称 | 尺寸px | 建议显示 | 落地锚点(x%,y%) | 地面 | 墙面 | 桌面 |
|---|---|---|---|---|---|---|---|
| `environment/window_v1.png` | window_v1 | 28×52 | 56×104 | — |  | ✓ |  |
| `environment/window_v2.png` | window_v2 | 28×52 | 56×104 | — |  | ✓ |  |
| `environment/window_pp.png` | window_pp | 32×24 | 64×48 | — |  | ✓ |  |
| `environment/sky.png` | sky | 200×200 | 400×400 | — |  |  |  |
| `environment/cloud_01.png` | cloud_01 | 576×324 | 1152×648 | — |  |  |  |
| `environment/cloud_02.png` | cloud_02 | 576×229 | 1152×458 | — |  |  |  |
| `environment/cloud_03.png` | cloud_03 | 320×22 | 640×44 | — |  |  |  |
| `environment/cloud_04.png` | cloud_04 | 576×291 | 1152×582 | — |  |  |  |

## object (2)

| 文件 | 名称 | 尺寸px | 建议显示 | 落地锚点(x%,y%) | 地面 | 墙面 | 桌面 |
|---|---|---|---|---|---|---|---|
| `objects/luggage_open.png` | luggage_open | 135×120 | 270×240 | 61.5%,99.2% | ✓ |  |  |
| `objects/luggage_closed.png` | luggage_closed | 130×110 | 260×220 | 63.5%,99.1% | ✓ |  |  |

## decoration (2)

| 文件 | 名称 | 尺寸px | 建议显示 | 落地锚点(x%,y%) | 地面 | 墙面 | 桌面 |
|---|---|---|---|---|---|---|---|
| `decorations/paintings.png` | paintings | 35×30 | 70×60 | — |  | ✓ |  |
| `decorations/wallart_pp.png` | wallart_pp | 64×28 | 128×56 | — |  | ✓ |  |

## 画风分组（重要）

| 来源包 | 件数 | 画风 | 能否混用 |
|---|---|---|---|
| bedroom/Individuals | 20 | 像素 3/4 视角 | ✓ 主力家具 |
| PP 素材板 (Pixel Plains) | 22 | 另一种像素画风 | ✗ 混用会违和，需先命名再定 |
| 森林 / 云 | 5 | 高清平涂(非像素) | △ 仅作窗外天空/云，分辨率高于像素家具 |
| 项目旧 assets | 2 | 旧像素风 | △ 行李箱，画风与 bedroom 包不同 |

## 缺失素材（卧室必需但全库没有）

| 缺的东西 | 搜索结果 | 建议 |
|---|---|---|
| 室内地板 | 全库无（Messy 是室外砖墙/草地） | 需提供，或生成可平铺纹理 |
| 室内墙面/墙纸 | 同上 | 同上 |
| 地毯 | 无 rug/carpet 素材 | 需提供 |
| 除螨仪 | 无 vacuum 素材 | 需提供 |
| 电脑/显示器 | bedroom 包无；PP 表有(pp_016 等)但画风不同 | 需确认采用哪个 |

## 说明

- **furniture**: 来自 bedroom 包的独立素材（已切好、无文字、无背景）
- **environment**: 天空/云/窗
- **_needs-naming**: 从 PP 素材板按连通域提取，画风与 bedroom 包不同，**需人工确认名称**
- 所有素材均已**裁掉透明留白**，导出为透明 PNG
- Messy 图集已扫描（466 格）但默认**不导出**：属室外砖墙/草地风格，不适合卧室。需要时运行 `python build_room_assets.py --with-messy`
- GLM 复核：`wardrobe_*` 被识别为"冰箱"（高大柜体），原始包命名为 Wardrobe，此处保留原名
- 强边缘检测对像素画不可靠（板条/窗格本身即高频）；已用 GLM 抽验确认**无文字残留**
