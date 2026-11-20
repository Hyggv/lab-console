# 实验室协作台

[打开 GitHub Pages 预览](https://hyggv.github.io/lab-console/)

正式站点使用 Sites D1 共享实验日志、补货和报修事项。普通网址可直接查看；协作链接允许访客在手机或电脑上新增及编辑日志、登记事项和更新处理状态。实验日期和读数以北京时间显示。

## 本地运行

使用 Node.js 22.13 或更新版本。在项目根目录执行 `node scripts/preview.mjs`，打开 http://127.0.0.1:4173/。本地服务默认监听环回地址并使用独立 SQLite 文件。要验证协作链接，请为本地进程设置临时的 `LAB_EDIT_KEY`，然后打开 `http://127.0.0.1:4173/#overview?edit=<本地密钥>`。密钥采用 32 随机字节的无填充 Base64URL 编码，共 43 个字符。使用 `node scripts/build.mjs` 生成 Sites Worker，入口为 `dist/server/index.js`。

空工作区的今日实验和物资事项会显示示例，首次保存对应类型的真实记录后显示实际内容。

## 模拟传感器

站点按时间生成同一组模拟温湿度，页面打开时每 10 秒刷新。趋势每 15 分钟取样，图表支持 6 小时和 24 小时视图。

## 分享链接

Sites 将 `LAB_EDIT_KEY` 保存为运行时密钥。协作链接把密钥放在地址的片段中，浏览器用同源 API 请求验证编辑权限。页面右上角的「分享链接」可调用手机分享面板或复制协作链接。更换密钥并重新部署后，旧协作链接仍可查看页面，编辑需要新链接。

## 发布到 GitHub Pages

GitHub Pages 托管网页。实验日志、事项以及模拟温湿度接口由独立的 HTTPS 后端提供。Pages 构建只打包 `out/github-pages/` 下的网页文件。

未配置 `LAB_API_ORIGIN` 时，Pages 发布只读预览。它持续生成模拟温湿度，显示示例排程和事项，并标注共享编辑尚未启用。

1. 若使用 Cloudflare Workers 和 D1，登录 Wrangler 后创建站点所用的 D1 数据库。复制 `wrangler.example.jsonc` 为 `wrangler.local.jsonc`，填入数据库名称、数据库 ID 和 Pages 网页的来源，例如 `https://你的用户名.github.io`。来源只填写协议和域名，仓库路径由页面自己保留。
2. 运行 `node scripts/build.mjs`，执行 `npx wrangler d1 migrations apply DB --remote --config wrangler.local.jsonc`，再执行 `npx wrangler deploy --config wrangler.local.jsonc`。用 `npx wrangler secret put LAB_EDIT_KEY --config wrangler.local.jsonc` 设置编辑密钥，使用由 32 字节随机数生成的 43 位 Base64URL 字符串。
3. 在目标 GitHub 仓库中将 Pages 的发布来源设为 GitHub Actions，并在 Actions 仓库变量中设置 `LAB_API_ORIGIN`，例如 `https://lab-console-api.你的子域.workers.dev`。推送到 `main` 或手动运行工作流发布。
4. 用 Actions 返回的 Pages 地址打开只读站点。在完整地址后加 `#overview?edit=<编辑密钥>`，即可生成允许新增和修改实验日志的协作链接。编辑密钥只保存在后端的密钥配置和协作链接里。

切换前先检查是否有需要从旧站导出的真实记录。数据库初始化脚本只创建表，真实记录需要单独导入。发布后用目标手机网络验证页面打开、协作链接编辑，以及另一台设备读取新记录。

