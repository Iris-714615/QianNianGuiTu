# 开发接入说明

## 入口与职责

| 文件 | 职责 |
| --- | --- |
| src/main.jsx / UnifiedApp.jsx | 首页、全局栏、两幕切换、终章 |
| src/shared.js | 存档、全局完整度 / 统计 / 证据、统一声音、离线资源解析 |
| src/Museum.jsx | 第一幕的 React 生命周期和存档适配 |
| src/museum-runtime.js / museum-core.js | 第一幕场景、巡逻、遮挡、路径、选择题、修复 |
| src/Chapter2.jsx | 自动对话、残图调查、实体抽屉、拼图、CG |
| src/SceneCabinet.jsx / cabinet-geometry.js | 九格抽屉与原房间共用美术坐标 |
| src/hero.js | 四向帧、完整伤痕状态、动作与脚底锚点 |
| src/config.js | CG 配置与播放地址校验 |
| scripts/make-offline.mjs | 构建产物 + 52 项实际运行资源内嵌为单文件 |

第一幕完成调用 `onComplete(detail)`，detail 为 schemaVersion=1，含 evidence、integrity、gameplaySeconds、stats。`completeMuseum()` 将证据写入同一个 run，随后挂载第二幕。两幕不是 iframe 拼接，不依赖 URL 参数伪造进度。

存档键 `guitu-integrated-v1`，设置键后缀 `-settings`。`runId` 防止前一轮组件卸载时覆盖新游戏；场景保存每 700ms 一次，卸载时再保存。内部历史字段 `shatters` 现在仅表示“安全恢复次数”，画面及文案均不表示碎裂。

`guitu:sound` 同步声音状态，`guitu:overlay` 暂停全局说明层下的游戏。第一幕卸载清理 interval、RAF 和监听器；第二幕清理 RAF、声音和延迟回调。调试观察函数为 `guituSnapshot()`、`guituMuseumSnapshot()`、`guituChapter2Snapshot()`，只有读数据能力。Vite 改动共享模块后验收前应刷新整页，避免开发热替换的旧闭包干扰诊断。

## 动作和房间坐标

第一幕逻辑世界 1280×720，以向右为 +X、向下为 +Y。移动、碰撞、灯光和朝向使用同一坐标。保安根据巡逻方向选择南 / 东 / 北 / 西四行；北行必须显示背面。主角到达调查物件后重新朝向物件中心。

第二幕逻辑归一化为百分比，背景美术为 1672×941。实体柜体坐标必须继续从 cabinet-geometry.js 读取，不能随意更换背景或独立贴一个柜子。镜头放大时场景、角色、抽屉一起变化；前后遮挡依据角色脚点。

主角图集 512×512 单帧，锚点 `(0.5,0.95)`。guard-walk 为 256×256 单帧。不要用 CSS 翻转整张角色来替代正背面，也不要通过 CSS 旋转精灵代替实际朝向图。

## 维护与打包

`npm test`；`npm run build`；`npm run test:sites`；`npm run offline`。离线资源清单在 make-offline.mjs 中显式列出；新增资源必须同步，避免 HTTP 成功而离线缺图。

未调用发布功能。保留 `.openai`、worker 与 Sites 构建支持。代码和素材已在当前工程中；原始附件及旧版源文件未修改，当前工程外的工作目录保留了整合前副本。
