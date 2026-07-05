window.GO_MURAPPI_CONFIG = {
  version: "1.6.2",
  storageKeys: {
    highScore: "go_murappi_high_score_v1",
    ranking: "go_murappi_local_ranking_v1",
    customStages: "go_murappi_custom_stages_v1",
    sound: "go_murappi_sound_v1",
    customPatternsFallback: "go_murappi_custom_patterns_fallback_v1"
  },
  gameplay: {
    maxHp: 3,
    startingLives: 3,
    gravity: 1720,
    jumpVelocity: -660,
    doubleJumpVelocity: -620,
    maxJumps: 2,
    stompBounceVelocity: -505,
    // 敵を踏みつけた直後に、専用1コマ画像を表示する時間。
    stompPoseTime: 0.16,
    // 斜め上から降下した際の踏みつけを優先する許容値。
    // 敵の左右へ少し外れていても、上から降りている場合は踏みつけとして扱う。
    stompHorizontalForgiveness: 24,
    stompTopForgiveness: 18,
    stompPreviousBottomGrace: 46,
    stompMinDownwardVelocity: 20,
    // 穴の左端へ着地しかけた場合、足先が残っていれば一度だけ縁へ引っ掛ける。
    holeEdgeCatchReach: 32,
    holeEdgeCatchVerticalGrace: 30,
    holeEdgeCatchHoldTime: 0.42,
    holeEdgeCatchCooldown: 0.95,
    coyoteTime: 0.13,
    jumpBufferTime: 0.16,
    hurtInvincibility: 1.35,
    basePlayerSpeed: 270,
    // ぴよっぴは、むらっぴが通った軌道を少し遅れて追従する。
    // 足元の高さも過去の軌道から再現するため、地上では浮かず、ジャンプだけが遅れて見える。
    piyoppiFollowDelay: 0.30,
    piyoppiTrailSeconds: 1.20,
    checkpointInterval: 1800,
    // プレイヤーの上端が論理画面の下端（720px）を越え、完全に見えなくなった時点で落下ミス。
    fallLimit: 720,
    stageClearBonus: 1500,
    remainingHpBonus: 250,
    remainingLifeBonus: 600
  },
  assets: {
    murappi: {
      idle: "assets/characters/murappi_threequarter.png",
      run: [
        "assets/characters/murappi_run_1.png",
        "assets/characters/murappi_run_2.png",
        "assets/characters/murappi_run_3.png",
        "assets/characters/murappi_run_4.png"
      ],
      jump: "assets/characters/murappi_jump.png",
      // 敵を踏みつけた瞬間の専用1コマ。ファイルが無い場合はjump画像へ自動フォールバック。
      stomp: "assets/characters/murappi_stomp.png",
      hurt: "assets/characters/murappi_hurt.png",
      // 残機を失う演出専用。別PNGへ差し替え可能。
      defeated: "assets/characters/murappi_defeated.png"
    },
    piyoppi: {
      idle: "assets/characters/piyoppi_front.png",
      hop: [
        "assets/characters/piyoppi_hop_1.png",
        "assets/characters/piyoppi_hop_2.png"
      ]
    },
    // 敵画像はPNGの複数フレーム。walk配列は何枚でも追加できます。
    enemies: {
      moko: {
        walk: [
          "assets/enemies/moko_walk_1.png",
          "assets/enemies/moko_walk_2.png",
          "assets/enemies/moko_walk_3.png"
        ],
        defeated: "assets/enemies/moko_defeated.png"
      },
      puni: {
        walk: [
          "assets/enemies/puni_walk_1.png",
          "assets/enemies/puni_walk_2.png",
          "assets/enemies/puni_walk_3.png"
        ],
        defeated: "assets/enemies/puni_defeated.png"
      },
      toge: {
        walk: [
          "assets/enemies/toge_walk_1.png",
          "assets/enemies/toge_walk_2.png",
          "assets/enemies/toge_walk_3.png"
        ],
        defeated: "assets/enemies/toge_defeated.png"
      },
      shizuku: {
        walk: [
          "assets/enemies/shizuku_walk_1.png",
          "assets/enemies/shizuku_walk_2.png",
          "assets/enemies/shizuku_walk_3.png"
        ],
        defeated: "assets/enemies/shizuku_defeated.png"
      }
    },
    // 標準ファイル名。ファイルが存在しない場合は内蔵Web Audio音へ自動フォールバックします。
    audio: {
      bgm: "assets/audio/bgm.mp3",
      jump: "assets/audio/jump.mp3",
      stomp: "assets/audio/stomp.mp3",
      damage: "assets/audio/damage.mp3",
      death: "assets/audio/death.mp3",
      goal: "assets/audio/goal.mp3",
      // 旧設定との互換用。通常は空文字のままでよい。
      hurt: "",
      clear: "",
      gameOver: "assets/audio/gameover.mp3"
    }
  },
  tileEditor: {
    tileSize: 120,
    rows: 6,
    minColumns: 20,
    maxColumns: 100,
    editorCellSize: 58,
    definitions: {
      empty: {
        locked: true,
        label: "消去",
        category: "編集",
        collision: "none",
        image: ""
      },
      sky_clear: {
        label: "空",
        category: "背景",
        collision: "none",
        image: "assets/tiles/sky_clear.png"
      },
      cloud: {
        label: "雲",
        category: "背景",
        collision: "none",
        image: "assets/tiles/cloud.png"
      },
      flower: {
        label: "花",
        category: "背景",
        collision: "none",
        image: "assets/tiles/flower.png"
      },
      ground_grass: {
        label: "草の地面",
        category: "地形",
        collision: "solid",
        image: "assets/tiles/ground_grass.png"
      },
      ground_stone: {
        label: "石の地面",
        category: "地形",
        collision: "solid",
        image: "assets/tiles/ground_stone.png"
      },
      hospital_path: {
        label: "病院前の道",
        category: "地形",
        collision: "solid",
        image: "assets/tiles/hospital_path.png"
      },
      platform_wood: {
        label: "木の足場",
        category: "地形",
        collision: "platform",
        image: "assets/tiles/platform_wood.png"
      },
      wall_hedge: {
        label: "生け垣の壁",
        category: "地形",
        collision: "solid",
        image: "assets/tiles/wall_hedge.png"
      },
      hole: {
        label: "穴（落下）",
        category: "地形",
        // 穴は接触しただけではミスにならない。足場判定がないため落下し、画面外まで落ちた時にミスになる。
        collision: "void",
        image: "assets/tiles/hole.png"
      },
      water: {
        label: "水",
        category: "危険",
        collision: "hazard",
        image: "assets/tiles/water.png"
      },
      enemy_moko: {
        locked: true,
        label: "敵：モコ",
        category: "敵",
        collision: "object",
        object: "enemy",
        enemyType: "moko",
        image: "assets/enemies/moko_walk_1.png"
      },
      enemy_puni: {
        locked: true,
        label: "敵：プニ",
        category: "敵",
        collision: "object",
        object: "enemy",
        enemyType: "puni",
        image: "assets/enemies/puni_walk_1.png"
      },
      enemy_toge: {
        locked: true,
        label: "敵：トゲ",
        category: "敵",
        collision: "object",
        object: "enemy",
        enemyType: "toge",
        image: "assets/enemies/toge_walk_1.png"
      },
      enemy_shizuku: {
        locked: true,
        label: "敵：シズク",
        category: "敵",
        collision: "object",
        object: "enemy",
        enemyType: "shizuku",
        image: "assets/enemies/shizuku_walk_1.png"
      },
      start: {
        locked: true,
        label: "スタート位置",
        category: "位置",
        collision: "object",
        object: "start",
        image: "assets/characters/murappi_side_right.png"
      },
      goal: {
        locked: true,
        label: "ゴール位置",
        category: "位置",
        collision: "object",
        object: "goal",
        image: "assets/characters/piyoppi_front.png"
      }
    }
  },
  leaderboard: {
    // 共通ランキング用API。空文字のままなら端末内ランキングのみ。
    // POST {name, score, clearedStages}, GET -> [{name, score, date}]
    endpoint: "",
    playerName: "むらっぴ"
  }
};
