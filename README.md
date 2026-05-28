# Booking Reservation Demo

予約フローの画面バリエーションを確認するための単体デモです。Vercel Previewで確認しやすい軽量なReact/Viteアプリとして作っています。

## What This Demo Includes

- TOP / plan selection / reservation flow concepts:
  - `bento`: Bento
  - `craft`: Craft
  - `studio`: Studio
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

The previous `neumorphism` and `glassmorphism` query keys remain as compatibility redirects, but they are no longer active review concepts.

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

## Design System Notes

The four active review concepts are registered as reusable design-system references in command-center:

- `bento`: Seasonal Bento
- `craft`: Craft Harvest
- `studio`: Orchard Gallery Studio
- `puerto`: Puerto Reservation

## Notes

- This is a static demo. It does not call reservation APIs, process payments, or store production data.
- Visual assets under `public/mock-assets/` are sample-only images for this review demo.
