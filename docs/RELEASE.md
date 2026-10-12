# 2026-10-12 Official Launch

https://kokuchijiko.peakheadz.com/ を2026-10-12 22:13:35 JSTにProduction確認。

配信source: `31d24f208c8e714e9861bb15345d78ecd14a3ae6`。Cloudflare Worker kokuchijiko-site / version `4521c8b5-bf03-4827-a20e-37413a2d77b4`。Custom Domain接続は既存DNSの競合・更新・削除0を確認し、上書きfalseで当該hostnameだけ追加した。

124人物、123肖像＋灰谷記録1問。全121画像のHTTP成功、8公開ルートの200とソース照合、主要4画像SHA一致、非公開資料パス404を確認。ブラウザで10問と誤答9問復習・再挑戦、320/390pxを検証。既存全124問ブラウザ証跡を同じ人物データ・エンジン・原画の根拠として再利用し、公開後に全124問を再走したとは扱わない。

Cloudflareのsame-originセキュリティscriptがHTML末尾に追加される。明示的にこの追加を分けてソースを照合し、セキュリティ設定やCSPを弱めていない。サイト独自の解析タグ・広告・外部fontはない。検索・観測はbaseline pending。Search Console処理や順位効果を公開成功から推定しない。

Human Reviewは本人合格。iPhone実機の指タップ・回転・読み上げは別途確認。本編は公開準備中。肖像の一括再生成はせず、ゲームだけ紙色frame/表示幅/明度を調整した。

## 2026-10-13 Search Console / related publication checkpoint

The existing peakheadz.com domain property accepted this site's sitemap submission. Initial sitemap processing shows "Could not fetch" (0 discovered), while direct HTTPS returns 200/application/xml with three URLs and robots permits crawling. Google's smartphone live test of the homepage at 05:07:43 JST fetched successfully, allowed crawl/indexing and confirmed the declared canonical. One homepage indexing request was accepted; actual indexing and search metrics remain unverified/baseline pending. No security controls or analytics settings were weakened or added.

The author site's Japanese About and English Legacy are published at main 6fef20d / Pages 3b456f0c-917c-4150-a22d-d7d99bd09ffb. PEAKHEADZ Projects links to the work at main cf66005 / Pages 0f3e3681-148f-4a99-88ef-3e4164c66305. All three public pages returned 200 with the official link on 2026-10-13. START's two separate making articles remain Draft PR11 under its independent hold (review source2277462); no links to unpublished articles were activated. Portrait originals and runtime bytes remain the deployed source31d24f2.
