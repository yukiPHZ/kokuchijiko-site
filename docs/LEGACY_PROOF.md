# 2015年のObjective-Cから2026年の124人へ

起点は[LoLQuizの固定commit](https://github.com/yukiPHZ/LoLQuiz/tree/25060dac90637801eff93e949f26c7b18ba27bbf)。ソースにはKikuta Yukihikoと2015年の制作日表記があり、現存するGit登録は2019-07-11です。App Store公開や当時の実機完成状態は未確認です。旧ソースを変更していません。

|旧実装|このWeb実装|
|---|---|
|Problem / CSVの問題モデル|data/characters.json、人物ID・画像・名前|
|loadProblemSet、4択|src/quiz-engine.mjsのloadProblemSet。正答＋異なる誤答3件|
|shuffleProblemSet|shuffle。Fisher–Yatesで自分の位置も交換候補へ|
|choiceText1〜4 / correctAnswers|createQuiz.answer、ID比較と二重加点防止|
|10問 / prepareForSegue|10問モード、floor(correct*100/total)|
|ResultViewController|src/quiz-ui.mjsの結果・再挑戦|

全124問、誤答復習、人物帳、日本語・かな・ローマ字の同一正本、記録問題、キーボード/モバイル表示は新しい実装です。旧画像やキャラクターを差し替えて転載したものではありません。

[旧出題と採点](https://github.com/yukiPHZ/LoLQuiz/blob/25060dac90637801eff93e949f26c7b18ba27bbf/LoLQuiz/QuizViewController.m) / [旧結果](https://github.com/yukiPHZ/LoLQuiz/blob/25060dac90637801eff93e949f26c7b18ba27bbf/LoLQuiz/ResultViewController.m)。新実装はこのrepoのsrcとtestsから再検証できます。全124問×32seedの4択一意性、採点、連打・古い回答拒否、単問復習をテストします。制作中の内部QAでは1024seedと全124問のブラウザ完走を確認し、公開前にHuman Review合格を得ています。実機iPhoneの指タップ・回転・読み上げは別途確認事項です。
