# Booking Reservation Demo

蒲郡オレンジパーク予約フローの単体デモです。既存の予約システムから切り離し、Vercel Previewで確認しやすい軽量なReact/Viteアプリとして作っています。

## What This Demo Includes

- TOP / plan selection / reservation flow concepts:
  - `bento`: 旬のベントー
  - `craft`: CRAFT HARVEST
  - `studio`: ARCHETYPE
  - `puerto`: Puerto Reservation
- Full happy path:
  `TOP -> プラン選択 -> 日時・人数 -> お客様情報 -> 来園メモ -> 支払い -> 確認 -> 完了`
- Account branch:
  `進み方選択 -> メール確認 -> 認証コード -> パスワード -> お客様情報`

## Review URLs

```text
/?pattern=bento
/?pattern=craft
/?pattern=studio
/?pattern=puerto
```

The previous `neumorphism` and `glassmorphism` query keys remain as compatibility redirects, but they are no longer active review concepts. Legacy query keys such as `fruit-trip`, `family-fun`, and `seasonal-ticket` are mapped to the current concepts.

## Local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Vercel

This repository is ready for Vercel Git integration.

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

`vercel.json` includes SPA rewrites so direct URLs continue to load the demo app.

## Notes

- This is a static demo. It does not call reservation APIs, process payments, or store production data.
- Photos under `public/mock-assets/` are temporary demo assets from Pexels and need final approval before production use.
