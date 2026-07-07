# GO！むらっぴ Version 1.6.5 素材仕様一覧

この文書は、現在のゲームで「どのタイミングに、どの画像・音声を割り当てられるか」と、その標準ファイル名・配置場所を整理したものです。

## 1. 基本ルール

- 画像は原則として **PNG形式・背景透過** を使用します。
- 差し替える場合は、同じファイル名で上書きすれば反映されます。
- ファイル名や配置先を変える場合は、`js/config.js` のパスも変更します。
- 音声は **MP3形式** を標準とします。
- MP3が存在しない、または読み込み失敗時は、内蔵のWeb Audio効果音・BGMへ自動フォールバックします。
- Version 1.6.5 では、オンライン時に GitHub Pages 上の最新版を優先して取得します。

---

## 2. むらっぴの画像

配置場所：`assets/characters/`

| アクション・表示タイミング | 標準ファイル名 | 現在の使われ方 | 備考 |
|---|---|---|---|
| タイトル画面・待機画像 | `murappi_threequarter.png` | タイトル画面、画像読込失敗時の予備 | フォールバック画像 |
| 地上走行 1コマ目 | `murappi_run_1.png` | 地面を走っている時 | 4コマを順番に再生 |
| 地上走行 2コマ目 | `murappi_run_2.png` | 地面を走っている時 | 4コマを順番に再生 |
| 地上走行 3コマ目 | `murappi_run_3.png` | 地面を走っている時 | 4コマを順番に再生 |
| 地上走行 4コマ目 | `murappi_run_4.png` | 地面を走っている時 | 4コマを順番に再生 |
| ジャンプ・空中 | `murappi_jump.png` | 1段ジャンプ、2段ジャンプ、通常の落下中 |  |
| 敵を踏みつけた瞬間 | `murappi_stomp.png` | 踏みつけ成立直後、約0.16秒表示 | 未配置時は `murappi_jump.png` を自動使用 |
| ダメージ | `murappi_hurt.png` | 敵や危険地形に接触し、体力が減った直後 |  |
| 死亡・残機喪失 | `murappi_defeated.png` | 体力0、または穴へ完全に落下した時 | 上へ跳ね、回転しながら落下 |
| **ステージクリア喜び 1コマ目** | **`murappi_clear_1.png`** | ゴール後、喜びポーズ演出中 | 未配置時は `murappi_threequarter.png` |
| **ステージクリア喜び 2コマ目** | **`murappi_clear_2.png`** | ゴール後、喜びポーズ演出中 | 未配置時は `murappi_threequarter.png` |
| ステージ編集のスタート印 | `murappi_side_right.png` | マップ編集画面のスタート位置アイコン |  |
| 予備正面画像 | `murappi_front.png` | 現時点では主要アクションへ直接割り当てていない | 将来用 |

### 喜びポーズ画像の推奨仕様

```text
配置先：assets/characters/murappi_clear_1.png
　　　：assets/characters/murappi_clear_2.png
形式　：PNG（背景透過）
コマ数：2コマ
推奨　：正面向きまたはやや正面向き、足元が画像下端付近
```

### むらっぴ画像の表示優先順位

1. 死亡：`murappi_defeated.png`
2. ダメージ：`murappi_hurt.png`
3. ステージクリア喜び：`murappi_clear_1.png` / `murappi_clear_2.png`
4. 踏みつけ直後：`murappi_stomp.png`
5. 空中：`murappi_jump.png`
6. 地上走行：`murappi_run_1.png` ～ `murappi_run_4.png`

---

## 3. ぴよっぴの画像

配置場所：`assets/characters/`

| アクション・表示タイミング | 標準ファイル名 | 現在の使われ方 |
|---|---|---|
| タイトル画面・予備 | `piyoppi_front.png` | タイトル画面、ゴール位置の編集アイコン、予備表示 |
| 歩行 1コマ目 | `piyoppi_hop_1.png` | 地面を歩く時の1コマ目 |
| 歩行 2コマ目 | `piyoppi_hop_2.png` | 地面を歩く時の2コマ目、空中時の画像 |
| 右向き予備画像 | `piyoppi_side_right.png` | 現時点では主要アニメーションへ直接割り当てていない |

ぴよっぴは、むらっぴの過去の軌道を約0.30秒遅れて追従します。地上では接地し、むらっぴのジャンプより少し遅れて空中へ移ります。

---

## 4. 敵キャラクター画像

配置場所：`assets/enemies/`

現在の敵は4種類です。標準は **歩行3コマ＋撃破1コマ** です。

### モコ
```text
moko_walk_1.png
moko_walk_2.png
moko_walk_3.png
moko_defeated.png
```

### プニ
```text
puni_walk_1.png
puni_walk_2.png
puni_walk_3.png
puni_defeated.png
```

### トゲ
```text
toge_walk_1.png
toge_walk_2.png
toge_walk_3.png
toge_defeated.png
```

### シズク
```text
shizuku_walk_1.png
shizuku_walk_2.png
shizuku_walk_3.png
shizuku_defeated.png
```

---

## 5. ステージ配置アイテム

配置場所：`assets/items/`

| アイテム | 標準ファイル名 | 効果 | 画像未配置時 |
|---|---|---|---|
| ハート | `item_heart.png` | 体力を1回復。上限3 | 内蔵ハート型 |
| 残機UP | `item_life.png` | 残機を1増加。上限99 | `1UP` |
| 空中ジャンプ強化 | `item_air_jump.png` | 一定時間、空中ジャンプ回数が増える | `J+` |

---

## 6. 効果音・BGM

配置場所：`assets/audio/`

| 発生タイミング | 標準ファイル名 | 動作 |
|---|---|---|
| ステージ開始からプレイ中 | `bgm.mp3` | ループ再生 |
| 1段ジャンプ・2段ジャンプ | `jump.mp3` | ジャンプ入力成立時 |
| 敵の踏みつけ成功 | `stomp.mp3` | 踏みつけ判定成立時 |
| 敵・危険地形からダメージ | `damage.mp3` | 体力が1減った瞬間 |
| 体力0・穴への落下による死亡 | `death.mp3` | 死亡演出開始時 |
| ステージクリア・全面クリア | `goal.mp3` | ゴール判定成立時 |
| ハート取得 | `item_heart.mp3` | ハート取得時 |
| 残機UP取得 | `item_life.mp3` | 残機UP取得時 |
| 空中ジャンプ強化取得 | `item_air_jump.mp3` | 空中ジャンプ強化取得時 |
| ゲームオーバー予備 | `gameover.mp3` | 予備用途 |

---

## 7. ステージタイル画像

配置場所：`assets/tiles/`

| 用途 | ファイル名 | 初期属性 |
|---|---|---|
| 空 | `sky_clear.png` | 通過 |
| 雲 | `cloud.png` | 通過 |
| 花 | `flower.png` | 通過 |
| 草の地面 | `ground_grass.png` | 固体 |
| 石の地面 | `ground_stone.png` | 固体 |
| 病院前の道 | `hospital_path.png` | 固体 |
| 木の足場 | `platform_wood.png` | 上面のみ乗れる |
| 生け垣の壁 | `wall_hedge.png` | 固体 |
| 穴 | `hole.png` | 足場なし |
| 水 | `water.png` | 接触ダメージ |

---

## 8. アプリアイコン

配置場所：`assets/ui/`

```text
icon-192.png
icon-512.png
```
