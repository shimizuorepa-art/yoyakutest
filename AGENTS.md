# AGENTS.md

このリポジトリは予約フローの単体デモです。

## Purpose

- Vercel PreviewでTOPから予約完了までのリニューアル案を確認する。
- 既存予約システムのAPI、Recoil、ルーティング、決済処理から切り離して安全に見せる。

## Rules

- 本番予約処理、決済、個人情報保存は実装しない。
- 画面は静的モックとして扱う。
- デモ用画像は `public/mock-assets/` に置く。
- Vercelで単体稼働する状態を保つ。
- 本体repo `booking-app-front` の代替ではない。
