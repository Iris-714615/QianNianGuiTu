# 第一关 → 第二关 → 视频的接入约定

第二关独立入口为本工程 `index.html`。第一关完成后可以同页跳转：

```js
const next = new URL('../chapter-2/', location.href);
next.search = new URLSearchParams({from:'museum', relic:'047', seller:'上一关购买记录中的卖方'}).toString();
location.href = next.href;
```

也可以把当前工程放在总项目根目录，然后跳到 `./?from=museum&relic=047&seller=某收藏者`。编号和卖方会进入第二关手札；URL 参数会被限制长度并以文本渲染。

## 第一关负责交付

- relic：已经依据身形确认的博物馆编号。
- seller：购买记录中找到的上一个收藏者/卖方。
- 第一关躲避保安、取得档案、回 NPC 拼好资料后的最终跳转。

## 第二关负责

- 延续“我想回家”，从旧铜像获得方向。
- 三片残图的可探索寻找：桌面、旧布、需要按线索辨认的暗格。
- 回旧铜像交互拼图、指出更早的一站。
- 信封打开后播放视频；视频结束可前往 `nextStageUrl`。

## 影片与下一关

只修改 `public/game.config.json`，不需要改游戏代码：

```json
{
 "videoUrl":"media/next-chapter.mp4",
 "nextStageUrl":"../chapter-3/",
 "videoTitle":"来时的路"
}
```

发布时请使用同站点相对地址。不要填写某台电脑的 `/Users/...` 或 Windows 盘符路径。

## 整合与提交

1. 将第一关目录与本工程合并在同一个站点内，保留各自资源的相对路径。
2. 修改第一关最终按钮，使其跳转到第二关目录。
3. 放入最终影片，检查本地播放。
4. 在总仓库根目录构建，并用 GitHub Pages/Actions 发布。
5. 线下演示从同一仓库 clone 后本地启动。

本包含第二关源码与本关美术。第一关的实际代码、美术和最终视频仍需由对应作者提供后整合。
