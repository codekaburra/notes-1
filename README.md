# notes

中英雙語筆記站。純靜態 HTML，沒有框架、沒有資料庫、沒有 build step。

```
public/
  index.html          筆記列表
  404.html
  assets/
    style.css         全站樣式（含深色模式）
    app.js            語言切換
  notes/
    *.html            每則筆記一個檔
```

## 本機預覽

```bash
npx serve public
```

或用 wrangler（跟正式環境行為一致）：

```bash
npx wrangler dev
```

## 加一則筆記

1. 複製 `public/notes/deploy.html` 成新檔名。
2. 改 `<title>` 與 `<body>` 上的 `data-title-zh` / `data-title-en`。
3. 兩個 `data-l="zh"` / `data-l="en"` 區塊各寫一種語言。
4. 在 `public/index.html` 的 `<ul class="notes">` 加一筆。

## 部署 A：GitHub Pages

推到 `main` 就會自動發布（`.github/workflows/pages.yml`）。

首次設定：repo → **Settings → Pages → Source** 選 **GitHub Actions**。

> repo 必須是 public 才免費。private repo 的 Pages 需要 GitHub Pro 以上，
> 而且不論如何，發布出去的網站本身都是公開可存取的。

## 部署 B：Cloudflare Workers

```bash
npx wrangler login    # 只要做一次
npx wrangler deploy
```

設定在 `wrangler.jsonc`。靜態站不需要 Worker 程式碼，只要 `assets.directory`。

## 兩邊都能跑的關鍵

- **所有路徑都是相對的**（`./assets/…`、`../assets/…`）。
  GitHub Pages 專案站掛在 `使用者名.github.io/repo名/` 子路徑下，絕對路徑會 404。
- **連結一律帶 `.html`**。Cloudflare 可以省略副檔名，GitHub Pages 不行。

換句話說：現在丟 GitHub Pages 玩，之後想換 Cloudflare 只要跑 `wrangler deploy`，檔案一行都不用改。
