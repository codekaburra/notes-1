# notes

**English** · [中文](#中文)

A bilingual (Chinese / English) notes site. Plain static HTML — no framework, no database, no build step.

```
public/
  index.html          note list
  404.html
  assets/
    style.css         site-wide styles (incl. dark mode)
    app.js            language toggle
  notes/
    *.html            one file per note
```

## Local preview

```bash
npx serve public
```

Or with wrangler (matches production behaviour):

```bash
npx wrangler dev
```

## Adding a note

1. Copy `public/notes/deploy.html` to a new filename.
2. Update `<title>` and the `data-title-zh` / `data-title-en` attributes on `<body>`.
3. Write one language in each of the `data-l="zh"` / `data-l="en"` blocks.
4. Add an entry to `<ul class="notes">` in `public/index.html`. Include its sequential
   `.n-index`, uppercase `.n-topic`, bilingual title/description, and `.n-date`.
   An image is optional; when needed, add `<img class="n-thumb" ...>` inside the link.

## Deploy A: GitHub Pages

Pushing to `main` publishes automatically (`.github/workflows/pages.yml`).

First-time setup: repo → **Settings → Pages → Source** → choose **GitHub Actions**.

> The repo must be public to stay free. Pages from a private repo needs GitHub Pro
> or above — and either way, the published site itself is publicly reachable.

## Deploy B: Cloudflare Workers

```bash
npx wrangler login    # once
npx wrangler deploy
```

Config lives in `wrangler.jsonc`. A static site needs no Worker script — just `assets.directory`.

## What makes it run on both

- **All paths are relative** (`./assets/…`, `../assets/…`).
  GitHub Pages project sites are served from a `username.github.io/repo/` subpath, where absolute paths 404.
- **Links always carry `.html`**. Cloudflare can drop the extension; GitHub Pages cannot.

In other words: ship it on GitHub Pages now, and switching to Cloudflare later takes only `wrangler deploy` — not a single file needs to change.

---

## 中文

[English](#notes) · **中文**

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

### 本機預覽

```bash
npx serve public
```

或用 wrangler（跟正式環境行為一致）：

```bash
npx wrangler dev
```

### 加一則筆記

1. 複製 `public/notes/deploy.html` 成新檔名。
2. 改 `<title>` 與 `<body>` 上的 `data-title-zh` / `data-title-en`。
3. 兩個 `data-l="zh"` / `data-l="en"` 區塊各寫一種語言。
4. 在 `public/index.html` 的 `<ul class="notes">` 加一筆，包含依序編號的
   `.n-index`、大寫 `.n-topic`、雙語標題與摘要，以及 `.n-date`。
   圖片可有可無；需要時在連結內加入 `<img class="n-thumb" ...>`。

### 部署 A：GitHub Pages

推到 `main` 就會自動發布（`.github/workflows/pages.yml`）。

首次設定：repo → **Settings → Pages → Source** 選 **GitHub Actions**。

> repo 必須是 public 才免費。private repo 的 Pages 需要 GitHub Pro 以上，
> 而且不論如何，發布出去的網站本身都是公開可存取的。

### 部署 B：Cloudflare Workers

```bash
npx wrangler login    # 只要做一次
npx wrangler deploy
```

設定在 `wrangler.jsonc`。靜態站不需要 Worker 程式碼，只要 `assets.directory`。

### 兩邊都能跑的關鍵

- **所有路徑都是相對的**（`./assets/…`、`../assets/…`）。
  GitHub Pages 專案站掛在 `使用者名.github.io/repo名/` 子路徑下，絕對路徑會 404。
- **連結一律帶 `.html`**。Cloudflare 可以省略副檔名，GitHub Pages 不行。

換句話說：現在丟 GitHub Pages 玩，之後想換 Cloudflare 只要跑 `wrangler deploy`，檔案一行都不用改。
