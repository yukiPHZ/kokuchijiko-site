2026-10-13: Canonical opt-in計測をProductionへ導入済み。main6e19f92 / Workere60424b6。独立4状態通信PASS、専用Streamの許可時HTTP204、未選択/拒否/GPC/RUM0、原典/肖像不変。GA4処理・mapping・Lite観測成立はpending、検証は需要に含めない。現在の正本はdocs/OBSERVATION_RELEASE.md。以下は候補/公開工程の履歴。

2026-10-13 opt-in release candidate: 独立headless Consent/Preview/local-origin/pre-installation Production gateを通過。中央正本から生成、専用Stream G-VNMZR2Y954を再利用。START公開2記事への自然な導線を追加し、外部資料は既存画面を保つ新しいタブで表示。計測のProduction配信/read-backは次工程。active/reporting/Lite/baselineは処理確認までpending。

2026-10-13 Observer候補: 中央peakheadz_kokuchijiko / source d5b738dから専用パッケージと固定adapterを生成。現在enabled=false、本番送信・deployなし。Consent・既存ゲーム操作の固定event配線を実装し、公開buildと10テスト成功。公開原画/人物正本は維持。Production通信検証前にactive扱いにしない。

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
