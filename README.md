# GO！むらっぴ Version 1.6.5

Version 1.6.4 を基礎に、**ステージクリア後の喜びポーズ演出**を追加した差分パッチです。

この成果物には **`assets` フォルダーを含めていません。**
現在使用している画像・音声を維持したまま、プログラム部分だけを更新できます。

## 今回の変更点

- ステージゴール直後、むらっぴが**3秒間その場で喜びポーズ**を取る
- 喜びポーズは**2コマ画像アニメーション**に対応
- まだ喜び画像が無い場合は、**`murappi_threequarter.png` を代用**して動作
- 3秒経過後に、従来どおり「次のステージへ」または「エンディングへ」の案内を表示
- README / 素材仕様書 / 変更履歴を最新仕様へ更新

## ステージクリア演出の仕様

### 動作

1. ゴール判定成立
2. クリア効果音再生
3. むらっぴがその場で**3秒間**喜びポーズ
4. その後、次のステージまたはエンディングへの案内を表示

### 設定値

`js/config.js` で変更できます。

```javascript
stageClearPoseTime: 3.0,
stageClearPoseFps: 4,
```

- `stageClearPoseTime` : 喜びポーズを取る時間（秒）
- `stageClearPoseFps` : 喜びポーズ2コマの切り替え速度

## 喜びポーズ画像

配置先は `assets/characters/` です。

```text
murappi_clear_1.png
murappi_clear_2.png
```

### まだ画像が無い場合の挙動

- `murappi_clear_1.png` が無い → `murappi_threequarter.png` を使用
- `murappi_clear_2.png` が無い → `murappi_threequarter.png` を使用

したがって、現時点で喜び画像を用意していなくてもゲームはそのまま動きます。

## 現在の主要アクション画像

配置先：`assets/characters/`

| 状態 | ファイル名 | 備考 |
|---|---|---|
| タイトル・待機 | `murappi_threequarter.png` | フォールバックにも使用 |
| 走行4コマ | `murappi_run_1.png` ～ `murappi_run_4.png` | 地上走行 |
| ジャンプ | `murappi_jump.png` | 空中時 |
| 踏みつけ直後 | `murappi_stomp.png` | 未配置時はジャンプ画像を代用 |
| ダメージ | `murappi_hurt.png` | 被弾時 |
| 死亡 | `murappi_defeated.png` | 穴落下・体力0 |
| クリア喜び1 | `murappi_clear_1.png` | 未配置時は `murappi_threequarter.png` |
| クリア喜び2 | `murappi_clear_2.png` | 未配置時は `murappi_threequarter.png` |

## 既存のアイテム仕様

ステージ編集画面では、引き続き以下の3種類を配置できます。

| アイテム | 効果 | 標準画像 |
|---|---|---|
| ハート | 体力を1回復（上限3） | `assets/items/item_heart.png` |
| 残機UP | 残機を1増加（上限99） | `assets/items/item_life.png` |
| 空中ジャンプ強化 | 10秒間、空中ジャンプ回数が増える | `assets/items/item_air_jump.png` |

## パッチ適用方法

現在GitHub Pagesへ配置しているゲーム一式へ、次の3ファイルを上書きしてください。

```text
js/config.js
js/game.js
service-worker.js
```

`assets` フォルダーは上書きしません。

## GitHub Pages更新時の注意

- Service Worker のキャッシュ名を Version 1.6.5 用に更新済みです
- Android では、更新後に **Chromeでページを2回再読み込み** してください
- その後、ホーム画面版アプリを完全終了して再起動してください

## 既存データの引き継ぎ

保存キーは Version 1.5 以降と同じため、同じ GitHub Pages URL で起動した場合、次を引き継ぎます。

- 編集済みステージ
- 追加したマップパターン
- ハイスコア
- 端末内ランキング
- サウンド設定

詳細な画像・音声仕様は `ASSET_SPECIFICATION.md` を参照してください。
