# 告知事項 Official

公式サイト: https://kokuchijiko.peakheadz.com/

菊田幸彦 / PEAKHEADZのオリジナル作品。123肖像と灰谷修一の記録1問、124人の人物帳・4択ゲームです。本編は公開準備中です。

## 公開境界

このrepoは公開可能なWebアプリだけを選別したものです。未公開脚本・映像・原画ボード・個人資料・生成プロンプト・内部QAログ・旧作品素材・制作母艦のGit履歴を含みません。srcとdataからpublicを生成します。人物帳とゲームは同じ人物正本を参照します。

## 検証と開発

Node.jsで npm run build → npm test → npm run check。依存パッケージは不要。ローカルは npm run serve（127.0.0.1:4186、公開対象publicのみ）。画像のハッシュはdata/asset-manifest.jsonで検証します。

## 配信

Cloudflare Workers Static Assets、Worker名kokuchijiko-site。assets.directoryはpublicだけです。DNS/Custom Domainは既存競合をchangesetで確認し、上書きfalseのAPIで接続します。Wrangler非TTYのCustom Domain設定は既存DNSを自動上書きする場合があるため、routesはこのconfigへ追加しません。公開操作は承認された対象revisionだけで行います。アカウントの認証情報はrepoへ保存しません。

## 制作史・素材

[Legacyの対応と証拠](docs/LEGACY_PROOF.md) / [公開素材](docs/RIGHTS.md)。美術には生成AIを使用しています。ゲームだけの紙色フレームと表示調整を適用し、人物帳と原画を維持しています。OGP画像は既存トップをブラウザで1200×630へ撮影したもの。apple-touch-iconはfaviconと同じ「告」の文字・色をコードで描画したものです。

公開日の実測、対象commit、Cloudflare versionは公開後の記録へ保存します。Google検索の登録・順位・解析成果をQA成功から推定しません。
