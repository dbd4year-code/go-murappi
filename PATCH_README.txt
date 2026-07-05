GO！むらっぴ Version 1.6.2 差分パッチ

■ 変更内容
- 敵を踏みつけた瞬間の「むらっぴ専用1コマ画像」に対応
- 標準ファイル名：assets/characters/murappi_stomp.png
- murappi_stomp.png が無い場合は、murappi_jump.png を自動使用
- 踏みつけ画像の表示時間は約0.16秒
- MP3の標準ファイル名と配置場所を統一
- MP3が存在しない場合、内蔵Web Audio音へ自動フォールバック
- 現在の画像・音声仕様を ASSET_SPECIFICATION.md に整理

■ 上書きするファイル
js/config.js
js/game.js
service-worker.js

■ assetsについて
この差分パッチには assets フォルダを含めていません。
現在使用中の画像・音声素材は上書きされません。

■ 踏みつけ専用画像を準備する場合
assets/characters/murappi_stomp.png

PNG・背景透過の1コマ画像として配置してください。
未配置のままでも、ジャンプ画像が代用されるため正常に動作します。
