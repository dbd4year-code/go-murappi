(() => {
  "use strict";

  const CFG = window.GO_MURAPPI_CONFIG;
  const DEFAULT_STAGES = window.GO_MURAPPI_DEFAULT_STAGES;
  const BASE_W = 1280;
  const BASE_H = 720;
  const GROUND_Y = 600;
  const PLAYER_H = 164;
  const PLAYER_W = 78;

  const $ = (id) => document.getElementById(id);
  const canvas = $("gameCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });

  const ui = {
    hud: $("hud"),
    score: $("scoreValue"),
    best: $("bestValue"),
    stage: $("stageValue"),
    lives: $("livesValue"),
    hp: $("hpValue"),
    title: $("titleScreen"),
    titleBest: $("titleBestValue"),
    start: $("startButton"),
    titleButton: $("titleButton"),
    pause: $("pauseButton"),
    sound: $("soundButton"),
    titleSound: $("titleSoundButton"),
    installButton: $("installButton"),
    installModal: $("installModal"),
    installInstructions: $("installInstructions"),
    installActionButton: $("installActionButton"),
    message: $("messageScreen"),
    messageKicker: $("messageKicker"),
    messageTitle: $("messageTitle"),
    messageBody: $("messageBody"),
    messageButton: $("messageButton"),
    ending: $("endingScreen"),
    endingScore: $("endingScoreValue"),
    endingBest: $("endingBestLabel"),
    endingTitle: $("endingTitleButton"),
    share: $("shareButton"),
    modalBackdrop: $("modalBackdrop"),
    rankingModal: $("rankingModal"),
    editorModal: $("editorModal"),
    rankingButton: $("rankingButton"),
    editorButton: $("editorButton"),
    rankingList: $("rankingList"),
    stageEditor: $("stageEditor"),
    editorStatus: $("editorStatus"),
    editorStageSelect: $("editorStageSelect"),
    editorTitleInput: $("editorTitleInput"),
    editorSpeedInput: $("editorSpeedInput"),
    editorColumnsInput: $("editorColumnsInput"),
    editorIncludeInput: $("editorIncludeInput"),
    newStage: $("newStageButton"),
    deleteStage: $("deleteStageButton"),
    saveDraftStage: $("saveDraftStageButton"),
    tilePalette: $("tilePalette"),
    selectedTileInfo: $("selectedTileInfo"),
    patternManager: $("patternManager"),
    patternForm: $("patternForm"),
    patternPreview: $("patternPreview"),
    patternPreviewEmpty: $("patternPreviewEmpty"),
    patternNameInput: $("patternNameInput"),
    patternCategoryInput: $("patternCategoryInput"),
    patternCollisionSelect: $("patternCollisionSelect"),
    patternImageInput: $("patternImageInput"),
    patternImageName: $("patternImageName"),
    patternFormNote: $("patternFormNote"),
    newPattern: $("newPatternButton"),
    savePattern: $("savePatternButton"),
    deletePattern: $("deletePatternButton"),
    resetPatterns: $("resetPatternsButton"),
    mapEditorCanvas: $("mapEditorCanvas"),
    mapEditorScroll: $("mapEditorScroll"),
    applyJson: $("applyJsonButton"),
    undoEditor: $("editorUndoButton"),
    fillGround: $("fillGroundButton"),
    clearMap: $("clearMapButton"),
    testStage: $("testStageButton"),
    saveStages: $("saveStagesButton"),
    exportStages: $("exportStagesButton"),
    importStages: $("importStagesInput"),
    resetStages: $("resetStagesButton"),
    toast: $("toast")
  };

  const memoryStore = Object.create(null);
  const safeLS = {
    getItem(key) {
      try { return window.localStorage.getItem(key); }
      catch { return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null; }
    },
    setItem(key, value) {
      try { window.localStorage.setItem(key, String(value)); }
      catch { memoryStore[key] = String(value); }
    },
    removeItem(key) {
      try { window.localStorage.removeItem(key); }
      catch { delete memoryStore[key]; }
    }
  };

  const storage = {
    getNumber(key, fallback = 0) {
      const value = Number(safeLS.getItem(key));
      return Number.isFinite(value) ? value : fallback;
    },
    getJSON(key, fallback) {
      try {
        const value = JSON.parse(safeLS.getItem(key));
        return value ?? fallback;
      } catch {
        return fallback;
      }
    },
    setJSON(key, value) {
      safeLS.setItem(key, JSON.stringify(value));
    }
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const padScore = (value) => Math.max(0, Math.floor(value)).toString().padStart(6, "0");
  const rectsOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const fmtDate = (iso) => {
    try { return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)); }
    catch { return ""; }
  };

  function toast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.remove("is-hidden");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => ui.toast.classList.add("is-hidden"), 2100);
  }

  let deferredInstallPrompt = null;

  function isStandaloneMode() {
    return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function updateInstallButton() {
    if (!ui.installButton) return;
    const installed = isStandaloneMode();
    ui.installButton.classList.toggle("is-installed", installed);
    ui.installButton.textContent = installed ? "スマホに追加済み" : "スマホに追加";
  }

  function showInstallGuide() {
    const installed = isStandaloneMode();
    const isIOS = isIOSDevice();
    const secure = window.isSecureContext;

    if (installed) {
      ui.installInstructions.innerHTML = `
        <h3>追加済みです</h3>
        <p>ホーム画面の「GO！むらっぴ」アイコンから、通常のアプリのように起動できます。</p>
        <p class="install-note">一度ゲームを最後まで読み込んだ後は、通信できない状態でも起動できます。</p>`;
      ui.installActionButton.textContent = "閉じる";
      ui.installActionButton.dataset.action = "close";
    } else if (!secure) {
      ui.installInstructions.innerHTML = `
        <h3>HTTPSで開く必要があります</h3>
        <p>この画面を端末へアプリとして追加するには、ゲームをHTTPSのURLから開いてください。</p>
        <p class="install-note">ZIPやHTMLファイルを端末内から直接開く方式では、オフライン保存機能を安定して利用できません。</p>`;
      ui.installActionButton.textContent = "閉じる";
      ui.installActionButton.dataset.action = "close";
    } else if (deferredInstallPrompt) {
      ui.installInstructions.innerHTML = `
        <h3>Androidへインストール</h3>
        <p>下のボタンを押すと、ホーム画面へ追加できます。</p>
        <p class="install-note">追加後はブラウザのタブではなく、独立したゲーム画面として起動します。</p>`;
      ui.installActionButton.textContent = "インストール";
      ui.installActionButton.dataset.action = "prompt";
    } else if (isIOS) {
      ui.installInstructions.innerHTML = `
        <h3>iPhone・iPadへ追加</h3>
        <ol>
          <li>このページを<strong>Safari</strong>で開きます。</li>
          <li>画面下部の<strong>共有ボタン</strong>を押します。</li>
          <li><strong>「ホーム画面に追加」</strong>を選びます。</li>
          <li>「Web Appとして開く」が表示された場合は有効にして追加します。</li>
        </ol>
        <p class="install-note">追加後はホーム画面のアイコンから起動してください。</p>`;
      ui.installActionButton.textContent = "閉じる";
      ui.installActionButton.dataset.action = "close";
    } else {
      ui.installInstructions.innerHTML = `
        <h3>ブラウザのメニューから追加</h3>
        <p>ブラウザのメニューを開き、<strong>「アプリをインストール」</strong>または<strong>「ホーム画面に追加」</strong>を選択してください。</p>
        <p class="install-note">インストール項目が出ない場合は、ChromeまたはSafariでHTTPSのURLを開き直してください。</p>`;
      ui.installActionButton.textContent = "閉じる";
      ui.installActionButton.dataset.action = "close";
    }
    openModal("install");
  }

  async function runInstallAction() {
    if (ui.installActionButton.dataset.action !== "prompt" || !deferredInstallPrompt) {
      closeModal();
      return;
    }
    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    promptEvent.prompt();
    try {
      const choice = await promptEvent.userChoice;
      toast(choice.outcome === "accepted" ? "ホーム画面へ追加しました" : "インストールを中止しました");
    } catch {}
    closeModal();
    updateInstallButton();
  }

  const TILE_CFG = CFG.tileEditor;
  const BASE_TILE_DEFS = deepClone(TILE_CFG.definitions);
  const TILE_DEFS = {};
  const PATTERN_DB_NAME = "go_murappi_custom_assets_v1";
  const PATTERN_STORE_NAME = "tile_patterns";

  function resetTileDefinitionsToBase() {
    Object.keys(TILE_DEFS).forEach((id) => delete TILE_DEFS[id]);
    Object.entries(BASE_TILE_DEFS).forEach(([id, def]) => {
      TILE_DEFS[id] = { ...deepClone(def), id, custom: false };
    });
  }

  resetTileDefinitionsToBase();

  const patternStore = {
    dbPromise: null,
    open() {
      if (!window.indexedDB) return Promise.reject(new Error("IndexedDB is unavailable"));
      if (this.dbPromise) return this.dbPromise;
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(PATTERN_DB_NAME, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(PATTERN_STORE_NAME)) {
            db.createObjectStore(PATTERN_STORE_NAME, { keyPath: "id" });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Pattern DB open failed"));
      });
      return this.dbPromise;
    },
    async all() {
      try {
        const db = await this.open();
        return await new Promise((resolve, reject) => {
          const request = db.transaction(PATTERN_STORE_NAME, "readonly").objectStore(PATTERN_STORE_NAME).getAll();
          request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.warn("Pattern DB fallback:", error);
        return storage.getJSON(CFG.storageKeys.customPatternsFallback, []);
      }
    },
    async put(record) {
      try {
        const db = await this.open();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(PATTERN_STORE_NAME, "readwrite");
          tx.objectStore(PATTERN_STORE_NAME).put(record);
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });
      } catch (error) {
        const rows = storage.getJSON(CFG.storageKeys.customPatternsFallback, []);
        const next = rows.filter((row) => row.id !== record.id);
        next.push(record);
        storage.setJSON(CFG.storageKeys.customPatternsFallback, next);
      }
    },
    async remove(id) {
      try {
        const db = await this.open();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(PATTERN_STORE_NAME, "readwrite");
          tx.objectStore(PATTERN_STORE_NAME).delete(id);
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });
      } catch (error) {
        const rows = storage.getJSON(CFG.storageKeys.customPatternsFallback, []);
        storage.setJSON(CFG.storageKeys.customPatternsFallback, rows.filter((row) => row.id !== id));
      }
    },
    async replaceAll(records) {
      try {
        const db = await this.open();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(PATTERN_STORE_NAME, "readwrite");
          const store = tx.objectStore(PATTERN_STORE_NAME);
          store.clear();
          records.forEach((record) => store.put(record));
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });
        safeLS.removeItem(CFG.storageKeys.customPatternsFallback);
      } catch (error) {
        storage.setJSON(CFG.storageKeys.customPatternsFallback, records);
      }
    },
    async clear() {
      await this.replaceAll([]);
    }
  };

  function applyPatternRecords(records) {
    resetTileDefinitionsToBase();
    for (const record of Array.isArray(records) ? records : []) {
      if (!record || !record.id) continue;
      if (record.deleted) {
        if (!BASE_TILE_DEFS[record.id]?.locked) delete TILE_DEFS[record.id];
        continue;
      }
      const base = BASE_TILE_DEFS[record.id] || {};
      TILE_DEFS[record.id] = {
        ...deepClone(base),
        ...deepClone(record),
        id: record.id,
        custom: !BASE_TILE_DEFS[record.id]
      };
    }
  }

  async function loadPatternDefinitions() {
    const records = await patternStore.all();
    applyPatternRecords(records);
    return records;
  }

  function makeBlankCells(rows, cols, fill = "empty") {
    return Array.from({ length: rows }, () => Array(cols).fill(fill));
  }

  function normalizeTileMap(tileMap) {
    const rows = clamp(Math.floor(Number(tileMap?.rows) || TILE_CFG.rows), 3, 12);
    const cols = clamp(Math.floor(Number(tileMap?.cols) || TILE_CFG.minColumns), TILE_CFG.minColumns, TILE_CFG.maxColumns);
    const tileSize = clamp(Math.floor(Number(tileMap?.tileSize) || TILE_CFG.tileSize), 60, 240);
    const cells = makeBlankCells(rows, cols);
    if (Array.isArray(tileMap?.cells)) {
      for (let r = 0; r < rows; r++) {
        const sourceRow = Array.isArray(tileMap.cells[r]) ? tileMap.cells[r] : [];
        for (let c = 0; c < cols; c++) {
          const id = sourceRow[c];
          cells[r][c] = Object.prototype.hasOwnProperty.call(TILE_DEFS, id) ? id : "empty";
        }
      }
    }
    return { tileSize, rows, cols, cells };
  }

  function convertLegacyStage(stage, stageIndex = 0) {
    const copy = deepClone(stage);
    copy.includeInGame = copy.includeInGame !== false;
    copy.draft = !copy.includeInGame;
    if (copy.tileMap) {
      copy.tileMap = normalizeTileMap(copy.tileMap);
      copy.length = copy.tileMap.cols * copy.tileMap.tileSize;
      copy.enemies = Array.isArray(copy.enemies) ? copy.enemies : [];
      copy.gaps = Array.isArray(copy.gaps) ? copy.gaps : [];
      copy.platforms = Array.isArray(copy.platforms) ? copy.platforms : [];
      return copy;
    }

    const tileSize = TILE_CFG.tileSize;
    const rows = TILE_CFG.rows;
    const cols = clamp(Math.ceil((Number(copy.length) || 5600) / tileSize), TILE_CFG.minColumns, TILE_CFG.maxColumns);
    const cells = makeBlankCells(rows, cols);
    const preferredGround = stageIndex >= 3 ? "hospital_path" : stageIndex === 1 ? "ground_stone" : "ground_grass";
    const groundId = TILE_DEFS[preferredGround]?.collision === "solid"
      ? preferredGround
      : Object.keys(TILE_DEFS).find((id) => TILE_DEFS[id]?.collision === "solid") || "empty";
    const holeId = TILE_DEFS.hole ? "hole" : "empty";
    const platformId = TILE_DEFS.platform_wood?.collision === "platform"
      ? "platform_wood"
      : Object.keys(TILE_DEFS).find((id) => TILE_DEFS[id]?.collision === "platform") || groundId;

    for (let c = 0; c < cols; c++) cells[rows - 1][c] = groundId;
    for (const gap of Array.isArray(copy.gaps) ? copy.gaps : []) {
      const a = Number(gap[0]), b = Number(gap[1]);
      for (let c = 0; c < cols; c++) {
        const center = c * tileSize + tileSize / 2;
        if (center >= a && center <= b) cells[rows - 1][c] = holeId;
      }
    }
    for (const platform of Array.isArray(copy.platforms) ? copy.platforms : []) {
      const first = clamp(Math.floor(Number(platform.x) / tileSize), 0, cols - 1);
      const last = clamp(Math.ceil((Number(platform.x) + Number(platform.w)) / tileSize) - 1, first, cols - 1);
      const row = clamp(Math.round(Number(platform.y) / tileSize), 1, rows - 2);
      for (let c = first; c <= last; c++) cells[row][c] = platformId;
    }
    for (const enemy of Array.isArray(copy.enemies) ? copy.enemies : []) {
      const col = clamp(Math.round(Number(enemy.x) / tileSize), 0, cols - 1);
      const surfaceY = enemy.platformY ? Number(enemy.platformY) : (rows - 1) * tileSize;
      const row = clamp(Math.round(surfaceY / tileSize) - 1, 0, rows - 2);
      cells[row][col] = `enemy_${enemy.type}`;
    }

    cells[rows - 2][1] = "start";
    cells[rows - 2][Math.max(2, cols - 2)] = "goal";
    for (let c = 7; c < cols - 3; c += 11) {
      if (TILE_DEFS.cloud && cells[1][c] === "empty") cells[1][c] = "cloud";
    }
    for (let c = 4; c < cols - 3; c += 9) {
      if (TILE_DEFS.flower && cells[rows - 2][c] === "empty" && TILE_DEFS[cells[rows - 1][c]]?.collision === "solid") {
        cells[rows - 2][c] = "flower";
      }
    }

    copy.tileMap = { tileSize, rows, cols, cells };
    copy.length = cols * tileSize;
    copy.enemies = [];
    copy.gaps = [];
    copy.platforms = [];
    return copy;
  }

  function normalizeStages(stages) {
    return stages.map((stage, index) => convertLegacyStage(stage, index));
  }

  function validateStages(stages) {
    if (!Array.isArray(stages) || stages.length < 1) throw new Error("ステージ配列がありません。");
    stages.forEach((stage, i) => {
      if (!stage || typeof stage !== "object") throw new Error(`ステージ${i + 1}がオブジェクトではありません。`);
      if (!String(stage.title || "").trim()) throw new Error(`ステージ${i + 1}の名称がありません。`);
      if (!Number.isFinite(Number(stage.speed)) || Number(stage.speed) < 100) throw new Error(`ステージ${i + 1}の走る速さが不正です。`);
      if (stage.tileMap) {
        const map = normalizeTileMap(stage.tileMap);
        if (map.cells.length !== map.rows || map.cells.some((row) => row.length !== map.cols)) {
          throw new Error(`ステージ${i + 1}のマップ配列が不正です。`);
        }
      } else {
        if (!Number.isFinite(Number(stage.length)) || Number(stage.length) < 1600) throw new Error(`ステージ${i + 1}の長さが不正です。`);
        if (!Array.isArray(stage.enemies) || !Array.isArray(stage.gaps) || !Array.isArray(stage.platforms)) {
          throw new Error(`ステージ${i + 1}の enemies / gaps / platforms が配列ではありません。`);
        }
      }
    });
    return stages;
  }

  function loadAllStages() {
    const custom = storage.getJSON(CFG.storageKeys.customStages, null);
    const source = custom || DEFAULT_STAGES;
    try {
      validateStages(source);
      return normalizeStages(deepClone(source));
    } catch (error) {
      console.warn(error);
      return normalizeStages(deepClone(DEFAULT_STAGES));
    }
  }

  function loadStages() {
    return loadAllStages().filter((stage) => stage.includeInGame !== false);
  }

  const assets = {};
  const dynamicImages = new Map();

  function getDynamicImage(src) {
    if (!src) return null;
    if (dynamicImages.has(src)) return dynamicImages.get(src);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (ui.editorModal && !ui.editorModal.classList.contains("is-hidden") && typeof drawEditorMap === "function") {
        drawEditorMap();
      }
    };
    image.src = src;
    dynamicImages.set(src, image);
    return image;
  }

  function drawCoverImage(image, x, y, w, h, offsetX = 0) {
    if (!image || !image.complete || !image.naturalWidth) return false;
    const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
    const sw = w / scale;
    const sh = h / scale;
    const maxSx = Math.max(0, image.naturalWidth - sw);
    const sx = maxSx ? ((offsetX % image.naturalWidth) / image.naturalWidth) * maxSx : 0;
    const sy = Math.max(0, (image.naturalHeight - sh) / 2);
    ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
    return true;
  }

  async function preloadAssets() {
    const paths = {
      murappiIdle: CFG.assets.murappi.idle,
      murappiJump: CFG.assets.murappi.jump,
      murappiStomp: CFG.assets.murappi.stomp,
      murappiHurt: CFG.assets.murappi.hurt,
      murappiDefeated: CFG.assets.murappi.defeated,
      piyoppiIdle: CFG.assets.piyoppi.idle
    };
    CFG.assets.murappi.run.forEach((path, i) => paths[`murappiRun${i}`] = path);
    CFG.assets.piyoppi.hop.forEach((path, i) => paths[`piyoppiHop${i}`] = path);
    Object.entries(CFG.assets.enemies).forEach(([name, enemy]) => {
      const walk = Array.isArray(enemy?.walk) ? enemy.walk : [enemy];
      walk.forEach((path, i) => paths[`enemy_${name}_walk_${i}`] = path);
      if (enemy?.defeated) paths[`enemy_${name}_defeated`] = enemy.defeated;
    });
    Object.entries(TILE_DEFS).forEach(([id, def]) => {
      if (def.image) paths[`tile_${id}`] = def.image;
    });

    const entries = Object.entries(paths).filter(([, src]) => Boolean(src));
    await Promise.all(entries.map(([key, src]) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => { assets[key] = image; resolve(); };
      image.onerror = () => { console.warn("Asset failed:", src); resolve(); };
      image.src = src;
    })));
  }

  class AudioEngine {
    constructor() {
      this.enabled = safeLS.getItem(CFG.storageKeys.sound) !== "off";
      this.ctx = null;
      this.bgmActive = false;
      this.nextNote = 0;
      this.step = 0;
      this.customBgm = null;
    }
    async unlock() {
      if (!this.enabled) return;
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
      }
      if (this.ctx.state === "suspended") {
        try { await this.ctx.resume(); } catch {}
      }
    }
    setEnabled(enabled) {
      this.enabled = enabled;
      safeLS.setItem(CFG.storageKeys.sound, enabled ? "on" : "off");
      if (!enabled) this.stopBgm();
      else this.unlock();
      updateSoundButtons();
    }
    toggle() { this.setEnabled(!this.enabled); }
    tone(freq, duration, type = "sine", volume = .08, when = 0, endFreq = null) {
      if (!this.enabled || !this.ctx) return;
      const start = this.ctx.currentTime + when;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + duration);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + duration + .03);
    }
    noise(duration = .08, volume = .08) {
      if (!this.enabled || !this.ctx) return;
      const length = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      const source = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 700;
      gain.gain.value = volume;
      source.buffer = buffer;
      source.connect(filter).connect(gain).connect(this.ctx.destination);
      source.start();
    }
    playCustom(name, fallback = null) {
      const src = CFG.assets.audio[name];
      if (!src) return false;
      const audio = new Audio(src);
      audio.volume = name === "stomp" ? .8 : .55;
      let failed = false;
      const fail = () => {
        if (failed) return;
        failed = true;
        if (typeof fallback === "function") fallback();
      };
      audio.addEventListener("error", fail, { once: true });
      const result = audio.play();
      if (result && typeof result.catch === "function") result.catch(fail);
      return true;
    }
    jump(doubleJump = false) {
      const fallback = () => {
        const base = doubleJump ? 560 : 430;
        this.tone(base, .11, "triangle", .07, 0, doubleJump ? 980 : 760);
        this.tone(doubleJump ? 840 : 690, .08, "sine", .035, .045, doubleJump ? 1180 : 900);
        if (doubleJump) this.tone(1040, .07, "sine", .02, .085, 1320);
      };
      if (this.playCustom("jump", fallback)) return;
      fallback();
    }
    stomp(combo = 1) {
      const fallback = () => {
        this.tone(125 + Math.min(combo, 6) * 8, .14, "sine", .18, 0, 52);
        this.tone(780, .055, "square", .025, 0, 430);
        this.noise(.075, .08);
      };
      if (this.playCustom("stomp", fallback)) return;
      fallback();
    }
    hurt() {
      const fallback = () => {
        this.tone(360, .28, "sawtooth", .07, 0, 110);
        this.tone(240, .22, "square", .025, .04, 85);
      };
      const tryLegacyOrSynth = () => { if (!this.playCustom("hurt", fallback)) fallback(); };
      if (this.playCustom("damage", tryLegacyOrSynth)) return;
      tryLegacyOrSynth();
    }
    death() {
      const fallback = () => [392, 330, 262, 196].forEach((f, i) => this.tone(f, .28, "triangle", .065, i * .11, f * .72));
      if (this.playCustom("death", fallback)) return;
      fallback();
    }
    clear() {
      const fallback = () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, .38, "triangle", .065, i * .12));
      const tryLegacyOrSynth = () => { if (!this.playCustom("clear", fallback)) fallback(); };
      if (this.playCustom("goal", tryLegacyOrSynth)) return;
      tryLegacyOrSynth();
    }
    gameOver() {
      const fallback = () => [392, 330, 262, 196].forEach((f, i) => this.tone(f, .35, "triangle", .06, i * .17, f * .86));
      if (this.playCustom("gameOver", fallback)) return;
      fallback();
    }
    startBgm(stage = null) {
      this.stopBgm();
      if (!this.enabled) return;
      const startGenerated = () => {
        this.bgmActive = true;
        if (this.ctx) this.nextNote = this.ctx.currentTime + .04;
        this.step = 0;
      };
      const src = stage?.bgm || CFG.assets.audio.bgm;
      if (src) {
        const custom = new Audio(src);
        this.customBgm = custom;
        custom.loop = true;
        custom.volume = .32;
        let failed = false;
        const fail = () => {
          if (failed || this.customBgm !== custom) return;
          failed = true;
          custom.pause();
          this.customBgm = null;
          startGenerated();
        };
        custom.addEventListener("error", fail, { once: true });
        const result = custom.play();
        if (result && typeof result.catch === "function") result.catch(fail);
        return;
      }
      startGenerated();
    }
    stopBgm() {
      this.bgmActive = false;
      if (this.customBgm) {
        this.customBgm.pause();
        this.customBgm.currentTime = 0;
        this.customBgm = null;
      }
    }
    tickBgm() {
      if (!this.enabled || !this.ctx || !this.bgmActive) return;
      const notes = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 392];
      const bass = [130.81, 130.81, 146.83, 146.83, 174.61, 174.61, 146.83, 146.83];
      const stepDuration = .26;
      while (this.nextNote < this.ctx.currentTime + .18) {
        const i = this.step % notes.length;
        this.tone(notes[i], .18, "triangle", .025, Math.max(0, this.nextNote - this.ctx.currentTime));
        if (i % 2 === 0) this.tone(bass[i], .25, "sine", .018, Math.max(0, this.nextNote - this.ctx.currentTime));
        if (i === 0 || i === 4) this.tone(notes[i] * 2, .09, "sine", .012, Math.max(0, this.nextNote - this.ctx.currentTime + .05));
        this.nextNote += stepDuration;
        this.step++;
      }
    }
  }

  const audio = new AudioEngine();

  const game = {
    state: "loading",
    stages: [],
    stageIndex: 0,
    stage: null,
    score: 0,
    highScore: storage.getNumber(CFG.storageKeys.highScore, 0),
    lives: CFG.gameplay.startingLives,
    hp: CFG.gameplay.maxHp,
    player: null,
    piyoppiTrail: [],
    tileRuntime: null,
    enemies: [],
    particles: [],
    cameraX: 0,
    time: 0,
    stageTime: 0,
    jumpBuffer: 0,
    coyote: 0,
    shake: 0,
    hitStop: 0,
    combo: 0,
    comboTimer: 0,
    checkpointX: 180,
    checkpointY: GROUND_Y - PLAYER_H,
    messageCallback: null,
    death: null,
    testMode: false,
    testStageSnapshot: null,
    frameTime: performance.now(),
    layout: { cssW: innerWidth, cssH: innerHeight, dpr: 1, scale: 1, offX: 0, offY: 0 }
  };

  const editor = {
    stages: [],
    stageIndex: 0,
    selectedTile: "ground_grass",
    painting: false,
    lastCellKey: "",
    history: [],
    ready: false,
    patternEditingId: null,
    patternPendingImage: "",
    patternPendingFileName: "",
    ctx: ui.mapEditorCanvas ? ui.mapEditorCanvas.getContext("2d") : null
  };

  function updateSoundButtons() {
    ui.sound.textContent = audio.enabled ? "♪" : "×";
    ui.sound.setAttribute("aria-label", audio.enabled ? "サウンドを切る" : "サウンドを入れる");
    ui.titleSound.textContent = audio.enabled ? "サウンド ON" : "サウンド OFF";
  }

  function resizeCanvas() {
    const cssW = Math.max(320, window.innerWidth);
    const cssH = Math.max(240, window.innerHeight);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const scale = Math.min(cssW / BASE_W, cssH / BASE_H);
    game.layout = {
      cssW, cssH, dpr, scale,
      offX: (cssW - BASE_W * scale) / 2,
      offY: (cssH - BASE_H * scale) / 2
    };
  }

  function buildTileRuntime(stage) {
    const map = normalizeTileMap(stage.tileMap);
    stage.tileMap = map;
    stage.length = map.cols * map.tileSize;
    const runtime = {
      tileSize: map.tileSize,
      rows: map.rows,
      cols: map.cols,
      colliders: [],
      hazards: [],
      enemySpawns: [],
      startX: 180,
      startMarkerBottom: GROUND_Y,
      goalX: stage.length - 180
    };

    for (let row = 0; row < map.rows; row++) {
      for (let col = 0; col < map.cols; col++) {
        const id = map.cells[row][col] || "empty";
        const def = TILE_DEFS[id] || TILE_DEFS.empty;
        const rect = { x: col * map.tileSize, y: row * map.tileSize, w: map.tileSize, h: map.tileSize, id, collision: def.collision };
        if (def.collision === "solid" || def.collision === "platform") runtime.colliders.push(rect);
        if (def.collision === "hazard") runtime.hazards.push(rect);
        if (def.object === "enemy") {
          runtime.enemySpawns.push({
            x: rect.x + (map.tileSize - 88) / 2,
            markerY: rect.y,
            markerBottom: rect.y + map.tileSize,
            type: def.enemyType
          });
        } else if (def.object === "start") {
          runtime.startX = rect.x + map.tileSize * .28;
          runtime.startMarkerBottom = rect.y + map.tileSize;
        } else if (def.object === "goal") {
          runtime.goalX = rect.x + map.tileSize * .5;
        }
      }
    }
    runtime.enemySpawns.forEach((spawn) => {
      const centerX = spawn.x + 44;
      const surface = findSurfaceBelow(runtime, centerX, spawn.markerY + 8);
      spawn.y = surface - 82;
      delete spawn.markerY;
      delete spawn.markerBottom;
    });
    return runtime;
  }

  function findSurfaceBelow(runtime, x, fromY = 0) {
    let best = null;
    for (const tile of runtime.colliders) {
      if (x < tile.x || x > tile.x + tile.w) continue;
      if (tile.y + 8 < fromY) continue;
      if (best === null || tile.y < best) best = tile.y;
    }
    return best ?? GROUND_Y;
  }

  function createEnemy(spawn, index) {
    return {
      ...spawn,
      x: Number(spawn.x),
      baseX: Number(spawn.x),
      y: Number(spawn.y),
      w: 88,
      h: 82,
      state: "alive",
      timer: 0,
      animTime: Math.random() * 2,
      phase: index * 1.73 + Math.random() * 2,
      direction: index % 2 ? 1 : -1,
      score: spawn.type === "toge" ? 220 : spawn.type === "shizuku" ? 180 : spawn.type === "puni" ? 150 : 120
    };
  }

  function resetRun() {
    game.score = 0;
    game.lives = CFG.gameplay.startingLives;
    game.hp = CFG.gameplay.maxHp;
    game.stageIndex = 0;
    game.combo = 0;
    game.comboTimer = 0;
    game.testMode = false;
    game.testStageSnapshot = null;
    const playable = loadStages();
    if (!playable.length) {
      toast("ゲーム本編に入るステージがありません。ステージ編集で設定してください。");
      return;
    }
    loadStage(0, true, playable);
  }

  function loadStage(index, freshRun = false, stageListOverride = null) {
    game.stages = stageListOverride ? normalizeStages(deepClone(stageListOverride)) : loadStages();
    if (!game.stages[index]) {
      if (game.testMode) openEditor();
      else showEnding();
      return;
    }
    game.stageIndex = index;
    game.stage = convertLegacyStage(deepClone(game.stages[index]), index);
    game.stage.speed = Number(game.stage.speed) || CFG.gameplay.basePlayerSpeed;
    game.tileRuntime = buildTileRuntime(game.stage);
    const startSurface = findSurfaceBelow(game.tileRuntime, game.tileRuntime.startX + PLAYER_W / 2, game.tileRuntime.startMarkerBottom - 8);
    game.player = {
      x: game.tileRuntime.startX,
      y: startSurface - PLAYER_H,
      prevY: startSurface - PLAYER_H,
      w: PLAYER_W,
      h: PLAYER_H,
      vy: 0,
      grounded: true,
      jumpsUsed: 0,
      invuln: 0,
      hurtTimer: 0,
      stompTimer: 0,
      runFrame: 0,
      deathSpin: 0,
      edgeCatchTimer: 0,
      edgeCatchCooldown: 0
    };
    resetPiyoppiTrail();
    game.enemies = game.tileRuntime.enemySpawns.map(createEnemy);
    game.particles = [];
    game.cameraX = Math.max(0, game.player.x - 180);
    game.stageTime = 0;
    game.jumpBuffer = 0;
    game.coyote = 0;
    game.shake = 0;
    game.hitStop = 0;
    game.death = null;
    game.checkpointX = game.player.x;
    game.checkpointY = game.player.y;
    game.state = "playing";
    ui.title.classList.add("is-hidden");
    ui.ending.classList.add("is-hidden");
    ui.message.classList.add("is-hidden");
    ui.hud.classList.remove("is-hidden");
    updateHud();
    audio.startBgm(game.stage);
    if (!freshRun) toast(`${game.stageIndex + 1}面　${game.stage.title}`);
  }

  function showTitle() {
    game.state = "title";
    game.testMode = false;
    game.testStageSnapshot = null;
    game.death = null;
    audio.stopBgm();
    ui.hud.classList.add("is-hidden");
    ui.message.classList.add("is-hidden");
    ui.ending.classList.add("is-hidden");
    ui.title.classList.remove("is-hidden");
    ui.titleBest.textContent = padScore(game.highScore);
    closeModal();
  }

  function showMessage(kicker, title, body, buttonText, callback) {
    game.messageCallback = callback;
    ui.messageKicker.textContent = kicker;
    ui.messageTitle.textContent = title;
    ui.messageBody.textContent = body;
    ui.messageButton.textContent = buttonText;
    ui.message.classList.remove("is-hidden");
  }

  function updateHud() {
    ui.score.textContent = padScore(game.score);
    ui.best.textContent = padScore(game.highScore);
    ui.stage.textContent = `${game.stageIndex + 1} / ${game.stages.length}`;
    ui.lives.textContent = `×${Math.max(0, game.lives)}`;
    ui.hp.textContent = "♥".repeat(Math.max(0, game.hp)) + "♡".repeat(Math.max(0, CFG.gameplay.maxHp - game.hp));
    ui.hp.setAttribute("aria-label", `体力${game.hp}`);
  }

  function saveHighScore() {
    if (game.score > game.highScore) {
      game.highScore = Math.floor(game.score);
      safeLS.setItem(CFG.storageKeys.highScore, String(game.highScore));
      ui.titleBest.textContent = padScore(game.highScore);
      return true;
    }
    return false;
  }

  function recordRanking(clearedStages) {
    const list = storage.getJSON(CFG.storageKeys.ranking, []);
    list.push({ score: Math.floor(game.score), date: new Date().toISOString(), clearedStages });
    list.sort((a, b) => b.score - a.score);
    storage.setJSON(CFG.storageKeys.ranking, list.slice(0, 10));
    submitRemoteRanking(clearedStages);
  }

  async function submitRemoteRanking(clearedStages) {
    const endpoint = CFG.leaderboard.endpoint;
    if (!endpoint) return;
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: CFG.leaderboard.playerName,
          score: Math.floor(game.score),
          clearedStages
        })
      });
    } catch (error) {
      console.warn("Leaderboard submit failed", error);
    }
  }

  function addScore(points) {
    game.score += Math.max(0, Math.floor(points));
    saveHighScore();
    updateHud();
  }

  function queueJump() {
    if (game.state !== "playing") return;
    game.jumpBuffer = CFG.gameplay.jumpBufferTime;
  }

  function performJump(doubleJump = false) {
    const p = game.player;
    const wasGrounded = p.grounded || game.coyote > 0;
    p.vy = doubleJump ? (CFG.gameplay.doubleJumpVelocity || CFG.gameplay.jumpVelocity) : CFG.gameplay.jumpVelocity;
    // 穴の縁に引っ掛かっている最中でも、タップすれば即座に脱出ジャンプへ移行する。
    p.edgeCatchTimer = 0;
    p.stompTimer = 0;
    p.grounded = false;
    p.jumpsUsed = Math.min(CFG.gameplay.maxJumps || 2, p.jumpsUsed + 1);
    game.coyote = 0;
    game.jumpBuffer = 0;
    if (doubleJump || !wasGrounded) {
      spawnBurst(p.x + p.w / 2, p.y + p.h * .72, doubleJump ? 11 : 7, "#d8fff1");
      game.particles.push({
        x: p.x + p.w / 2, y: p.y + p.h * .78, vx: 0, vy: 0,
        life: .34, maxLife: .34, size: doubleJump ? 18 : 13, color: "#f8fff2", gravity: 0, type: "ring"
      });
    } else {
      spawnDust(p.x + 34, p.y + p.h - 6, 6, "#fff4d3");
    }
    audio.jump(doubleJump);
  }

  function playerHit() {
    const p = game.player;
    if (p.invuln > 0 || game.state !== "playing") return;
    game.hp--;
    p.invuln = CFG.gameplay.hurtInvincibility;
    p.hurtTimer = .42;
    p.stompTimer = 0;
    p.vy = -360;
    p.x = Math.max(120, p.x - 55);
    game.shake = Math.max(game.shake, 12);
    spawnBurst(p.x + p.w / 2, p.y + p.h / 2, 16, "#ffd3c8");
    audio.hurt();
    updateHud();

    if (game.hp <= 0) startDeathSequence("hp");
  }

  function fallMiss() {
    if (game.state !== "playing") return;
    game.hp = 0;
    updateHud();
    startDeathSequence("fall");
  }

  function startDeathSequence(reason = "hp") {
    if (game.state !== "playing") return;
    const p = game.player;
    game.state = "dying";
    audio.stopBgm();
    audio.death();
    game.hp = 0;
    updateHud();
    game.death = { reason, elapsed: 0, resolved: false };
    p.grounded = false;
    p.hurtTimer = 0;
    p.stompTimer = 0;
    p.invuln = 0;
    p.deathSpin = 0;
    p.vy = -690;
    // 穴へ落ち切ってから判定されるため、演出だけは画面下端から見える位置へ戻す。
    if (reason === "fall" && p.y > BASE_H - PLAYER_H - 8) {
      p.y = BASE_H - PLAYER_H - 8;
      p.prevY = p.y;
    }
    game.shake = Math.max(game.shake, 16);
    spawnBurst(p.x + p.w / 2, p.y + p.h * .6, 18, "#fff1a8");
  }

  function updateDeathAnimation(dt) {
    const death = game.death;
    const p = game.player;
    if (!death || !p || death.resolved) return;
    death.elapsed += dt;
    p.vy += CFG.gameplay.gravity * .82 * dt;
    p.y += p.vy * dt;
    p.deathSpin += dt * 5.2;
    updateParticles(dt);
    if (death.elapsed < 1.45 && p.y < BASE_H + 230) return;

    death.resolved = true;
    game.lives--;
    updateHud();
    if (game.lives <= 0) {
      gameOver(true);
      return;
    }
    respawnPlayer(death.reason === "fall" ? "穴に落ちました" : "体力がなくなりました");
  }

  function respawnPlayer(message) {
    game.hp = CFG.gameplay.maxHp;
    game.player.x = Math.max(game.tileRuntime?.startX || 180, game.checkpointX);
    const respawnY = Number.isFinite(game.checkpointY) ? game.checkpointY : GROUND_Y - PLAYER_H;
    game.player.y = respawnY;
    game.player.prevY = game.player.y;
    game.player.vy = 0;
    game.player.jumpsUsed = 0;
    game.player.invuln = 2.0;
    game.player.grounded = true;
    game.player.deathSpin = 0;
    game.player.edgeCatchTimer = 0;
    game.player.edgeCatchCooldown = 0;
    game.death = null;
    game.state = "playing";
    resetPiyoppiTrail();
    game.cameraX = Math.max(0, game.player.x - 260);
    updateHud();
    audio.startBgm(game.stage);
    toast(`${message}　残機 ×${game.lives}`);
  }

  function gameOver(fromDeath = false) {
    game.state = "gameover";
    audio.stopBgm();
    if (!fromDeath) audio.gameOver();
    const isBest = saveHighScore();
    recordRanking(game.stageIndex);
    showMessage(
      "GAME OVER",
      "もう一度、前へ。",
      `スコア ${padScore(game.score)}${isBest ? "\n最高スコア更新！" : ""}`,
      game.testMode ? "ステージ編集へ" : "タイトルへ",
      game.testMode ? openEditor : showTitle
    );
    setTimeout(() => {
      if (game.state === "gameover") {
        if (game.testMode) openEditor();
        else showTitle();
      }
    }, 5000);
  }

  function stageClear() {
    if (game.state !== "playing") return;
    game.state = "stageclear";
    audio.stopBgm();
    audio.clear();
    const bonus = CFG.gameplay.stageClearBonus +
      game.hp * CFG.gameplay.remainingHpBonus +
      game.lives * CFG.gameplay.remainingLifeBonus;
    addScore(bonus);

    if (game.testMode) {
      showMessage(
        "TEST CLEAR",
        "テストプレイ完了",
        `このステージをクリアしました。\nテストスコア ${padScore(game.score)}`,
        "ステージ編集へ",
        openEditor
      );
      return;
    }

    const final = game.stageIndex >= game.stages.length - 1;
    showMessage(
      final ? "FINAL STAGE CLEAR" : "STAGE CLEAR",
      final ? "病院が見えた！" : game.stage.title,
      `クリアボーナス +${bonus.toLocaleString("ja-JP")}\n現在のスコア ${padScore(game.score)}`,
      final ? "エンディングへ" : "次のステージへ",
      () => {
        ui.message.classList.add("is-hidden");
        if (final) showEnding();
        else loadStage(game.stageIndex + 1);
      }
    );
  }

  function showEnding() {
    game.state = "ending";
    audio.stopBgm();
    audio.clear();
    const isBest = saveHighScore();
    recordRanking(game.stages.length);
    ui.hud.classList.add("is-hidden");
    ui.message.classList.add("is-hidden");
    ui.endingScore.textContent = padScore(game.score);
    ui.endingBest.textContent = isBest ? "NEW BEST SCORE" : `BEST ${padScore(game.highScore)}`;
    ui.ending.classList.remove("is-hidden");
  }

  function getCheckpointSurface(x) {
    if (!game.tileRuntime) return getGroundAvailable(x) ? GROUND_Y : null;
    let surface = null;
    for (const tile of game.tileRuntime.colliders) {
      if (x < tile.x + 8 || x > tile.x + tile.w - 8) continue;
      if (tile.y > GROUND_Y + 2) continue;
      if (surface === null || tile.y > surface) surface = tile.y;
    }
    return surface;
  }

  function getGroundAvailable(x) {
    if (game.tileRuntime) return getCheckpointSurface(x) !== null;
    return !game.stage.gaps.some(([a, b]) => x >= a && x <= b);
  }

  function getSurfaceAt(player, previousBottom, currentBottom) {
    let surface = null;
    if (game.tileRuntime) {
      for (const tile of game.tileRuntime.colliders) {
        const horizontal = player.x + player.w * .78 > tile.x && player.x + player.w * .22 < tile.x + tile.w;
        if (horizontal && previousBottom <= tile.y + 10 && currentBottom >= tile.y && player.vy >= 0) {
          if (surface === null || tile.y < surface) surface = tile.y;
        }
      }
      return surface;
    }

    for (const platform of game.stage.platforms) {
      const px = Number(platform.x), py = Number(platform.y), pw = Number(platform.w);
      const horizontal = player.x + player.w * .78 > px && player.x + player.w * .22 < px + pw;
      if (horizontal && previousBottom <= py + 10 && currentBottom >= py && player.vy >= 0) {
        if (surface === null || py < surface) surface = py;
      }
    }
    const footX = player.x + player.w * .52;
    if (getGroundAvailable(footX) && previousBottom <= GROUND_Y + 12 && currentBottom >= GROUND_Y && player.vy >= 0) {
      if (surface === null || GROUND_Y < surface) surface = GROUND_Y;
    }
    return surface;
  }

  function getHoleEdgeCatch(player, previousBottom, currentBottom) {
    if (!game.tileRuntime || !game.stage?.tileMap || player.vy < 0 || player.edgeCatchCooldown > 0) return null;

    const map = game.stage.tileMap;
    const reach = Math.max(8, Number(CFG.gameplay.holeEdgeCatchReach) || 32);
    const verticalGrace = Math.max(8, Number(CFG.gameplay.holeEdgeCatchVerticalGrace) || 30);
    const trailingFoot = player.x + player.w * .10;
    const leadingFoot = player.x + player.w * .88;

    for (const tile of game.tileRuntime.colliders) {
      // 穴の直前にある「乗れる地形」の右端だけを対象にする。
      if (tile.collision !== "solid" && tile.collision !== "platform") continue;
      const row = Math.round(tile.y / map.tileSize);
      const col = Math.round(tile.x / map.tileSize);
      const nextId = map.cells?.[row]?.[col + 1];
      const nextDef = TILE_DEFS[nextId] || TILE_DEFS.empty;
      if (nextDef?.collision !== "void") continue;

      const edgeX = tile.x + tile.w;
      const nearEdge = trailingFoot <= edgeX + 8 && leadingFoot >= edgeX - reach;
      const crossesSurface = previousBottom <= tile.y + verticalGrace && currentBottom >= tile.y - 12;
      if (!nearEdge || !crossesSurface) continue;

      return { surface: tile.y, edgeX };
    }
    return null;
  }

  function resetPiyoppiTrail() {
    const p = game.player;
    if (!p) {
      game.piyoppiTrail = [];
      return;
    }
    const delay = Math.max(.08, Number(CFG.gameplay.piyoppiFollowDelay) || .30);
    const speed = Number(game.stage?.speed || CFG.gameplay.basePlayerSpeed || 270);
    const footY = p.y + p.h;
    game.piyoppiTrail = [
      {
        time: game.time - delay - .001,
        x: Math.max(0, p.x - speed * delay),
        footY,
        grounded: true,
        vy: 0,
        runFrame: p.runFrame
      },
      {
        time: game.time,
        x: p.x,
        footY,
        grounded: p.grounded,
        vy: p.vy,
        runFrame: p.runFrame
      }
    ];
  }

  function recordPiyoppiTrail() {
    const p = game.player;
    if (!p) return;
    const trail = game.piyoppiTrail || (game.piyoppiTrail = []);
    trail.push({
      time: game.time,
      x: p.x,
      footY: p.y + p.h,
      grounded: p.grounded,
      vy: p.vy,
      runFrame: p.runFrame
    });
    const keepSeconds = Math.max(
      Number(CFG.gameplay.piyoppiTrailSeconds) || 1.20,
      (Number(CFG.gameplay.piyoppiFollowDelay) || .30) + .45
    );
    const cutoff = game.time - keepSeconds;
    while (trail.length > 2 && trail[1].time < cutoff) trail.shift();
  }

  function getPiyoppiTrailState() {
    const p = game.player;
    const trail = game.piyoppiTrail;
    if (!p || !trail || !trail.length) {
      return p ? { x: p.x - 90, footY: p.y + p.h, grounded: p.grounded, vy: p.vy, runFrame: p.runFrame } : null;
    }

    const delay = Math.max(.08, Number(CFG.gameplay.piyoppiFollowDelay) || .30);
    const targetTime = game.time - delay;
    let before = trail[0];
    let after = trail[trail.length - 1];

    if (targetTime <= before.time) return { ...before };
    if (targetTime >= after.time) return { ...after };

    for (let i = 1; i < trail.length; i++) {
      if (trail[i].time >= targetTime) {
        before = trail[i - 1];
        after = trail[i];
        break;
      }
    }

    const span = Math.max(.0001, after.time - before.time);
    const amount = clamp((targetTime - before.time) / span, 0, 1);
    const stateSource = amount < .5 ? before : after;
    return {
      x: lerp(before.x, after.x, amount),
      footY: lerp(before.footY, after.footY, amount),
      grounded: stateSource.grounded,
      vy: lerp(before.vy, after.vy, amount),
      runFrame: lerp(before.runFrame, after.runFrame, amount)
    };
  }

  function resolveHorizontalTileCollision(previousX) {
    if (!game.tileRuntime) return false;
    const p = game.player;
    const previousRight = previousX + p.w - 11;
    const currentRight = p.x + p.w - 11;
    const top = p.y + 16;
    const bottom = p.y + p.h - 9;
    let blocked = false;
    for (const tile of game.tileRuntime.colliders) {
      if (tile.collision !== "solid") continue;
      const vertical = bottom > tile.y + 8 && top < tile.y + tile.h - 8;
      if (!vertical) continue;
      if (previousRight <= tile.x + 7 && currentRight > tile.x) {
        p.x = tile.x - (p.w - 11);
        blocked = true;
      }
    }
    return blocked;
  }

  function resolveCeilingTileCollision(previousTop, currentTop) {
    if (!game.tileRuntime || game.player.vy >= 0) return;
    const p = game.player;
    for (const tile of game.tileRuntime.colliders) {
      if (tile.collision !== "solid") continue;
      const horizontal = p.x + p.w * .76 > tile.x && p.x + p.w * .24 < tile.x + tile.w;
      const tileBottom = tile.y + tile.h;
      if (horizontal && previousTop >= tileBottom - 10 && currentTop <= tileBottom) {
        p.y = tileBottom - 13;
        p.vy = 90;
        spawnDust(p.x + p.w / 2, tileBottom, 3, "#e8f4ef");
        return;
      }
    }
  }

  function checkTileHazards() {
    if (!game.tileRuntime) return false;
    const box = getPlayerHitbox();
    for (const hazard of game.tileRuntime.hazards) {
      const inner = { x: hazard.x + 8, y: hazard.y + 5, w: hazard.w - 16, h: hazard.h - 5 };
      if (rectsOverlap(box, inner)) {
        fallMiss();
        return true;
      }
    }
    return false;
  }

  function update(dt) {
    audio.tickBgm();
    if (game.state === "dying") {
      updateDeathAnimation(Math.min(dt, .033));
      return;
    }
    if (game.state !== "playing") {
      updateParticles(Math.min(dt, .033));
      return;
    }

    if (game.hitStop > 0) {
      game.hitStop -= dt;
      updateParticles(dt * .25);
      return;
    }

    game.time += dt;
    game.stageTime += dt;
    game.shake = Math.max(0, game.shake - 32 * dt);
    game.comboTimer -= dt;
    if (game.comboTimer <= 0) game.combo = 0;

    const p = game.player;
    p.prevY = p.y;
    const previousX = p.x;
    p.invuln = Math.max(0, p.invuln - dt);
    p.hurtTimer = Math.max(0, p.hurtTimer - dt);
    p.stompTimer = Math.max(0, Number(p.stompTimer || 0) - dt);
    p.edgeCatchTimer = Math.max(0, Number(p.edgeCatchTimer || 0) - dt);
    p.edgeCatchCooldown = Math.max(0, Number(p.edgeCatchCooldown || 0) - dt);
    game.jumpBuffer = Math.max(0, game.jumpBuffer - dt);
    game.coyote = p.grounded ? CFG.gameplay.coyoteTime : Math.max(0, game.coyote - dt);

    if (game.jumpBuffer > 0 && p.hurtTimer <= 0) {
      if (p.grounded || game.coyote > 0) {
        performJump(false);
      } else if (p.jumpsUsed < (CFG.gameplay.maxJumps || 2)) {
        // 足場からそのまま落ちた場合は、未使用の1段目を空中から使える。
        // すでに1回跳んでいる場合だけ2段ジャンプとして扱う。
        performJump(p.jumpsUsed > 0);
      }
    }

    const speed = Number(game.stage.speed || CFG.gameplay.basePlayerSpeed);
    // 穴の縁へ引っ掛かった直後だけ自動走行を短時間止め、ジャンプ入力の猶予を作る。
    const movementScale = p.edgeCatchTimer > 0 ? 0 : 1;
    p.x += speed * dt * movementScale;
    resolveHorizontalTileCollision(previousX);

    const previousTop = p.prevY + 13;
    p.vy += CFG.gameplay.gravity * dt;
    p.y += p.vy * dt;
    resolveCeilingTileCollision(previousTop, p.y + 13);

    const previousBottom = p.prevY + p.h;
    const currentBottom = p.y + p.h;
    let surface = getSurfaceAt(p, previousBottom, currentBottom);
    let edgeCatch = null;
    if (surface === null) edgeCatch = getHoleEdgeCatch(p, previousBottom, currentBottom);
    if (edgeCatch) surface = edgeCatch.surface;

    if (surface !== null) {
      p.y = surface - p.h;
      if (!p.grounded && p.vy > 180) spawnDust(p.x + p.w / 2, surface, 4, "#fff4d3");
      p.vy = 0;
      p.grounded = true;
      p.jumpsUsed = 0;
      game.coyote = CFG.gameplay.coyoteTime;

      if (edgeCatch) {
        // 身体の一部を地面側へ戻して、穴へ吸い込まれる連続判定を防ぐ。
        p.x = Math.min(p.x, edgeCatch.edgeX - p.w * .35);
        p.edgeCatchTimer = Math.max(.18, Number(CFG.gameplay.holeEdgeCatchHoldTime) || .42);
        p.edgeCatchCooldown = Math.max(.45, Number(CFG.gameplay.holeEdgeCatchCooldown) || .95);
        spawnDust(edgeCatch.edgeX - 8, surface, 7, "#fff4d3");
      }
    } else {
      p.grounded = false;
    }

    if (checkTileHazards()) return;
    if (p.y > CFG.gameplay.fallLimit) {
      fallMiss();
      return;
    }

    const nextCheckpoint = Math.floor(p.x / CFG.gameplay.checkpointInterval) * CFG.gameplay.checkpointInterval;
    const checkpointSurface = getCheckpointSurface(nextCheckpoint + p.w / 2);
    if (nextCheckpoint > game.checkpointX && checkpointSurface !== null) {
      game.checkpointX = nextCheckpoint;
      game.checkpointY = checkpointSurface - PLAYER_H;
    }

    updateEnemies(dt);
    checkEnemyCollisions();
    updateParticles(dt);

    p.runFrame += dt * (p.grounded ? 11 : 3);
    recordPiyoppiTrail();

    const targetCamera = clamp(p.x - 265, 0, Math.max(0, game.stage.length - BASE_W + 170));
    game.cameraX = lerp(game.cameraX, targetCamera, 1 - Math.pow(.0009, dt));

    if (p.x >= (game.tileRuntime?.goalX || game.stage.length - 230) - 60) stageClear();
  }

  function updateEnemies(dt) {
    for (const e of game.enemies) {
      e.animTime += dt;
      if (e.state === "alive") {
        e.x = e.baseX + Math.sin(game.time * 1.55 + e.phase) * 15;
      } else if (e.state === "squash") {
        e.timer -= dt;
        if (e.timer <= 0) e.state = "dead";
      }
    }
  }

  function getPlayerHitbox() {
    const p = game.player;
    return { x: p.x + 14, y: p.y + 13, w: p.w - 25, h: p.h - 18 };
  }

  function checkEnemyCollisions() {
    const p = game.player;
    const box = getPlayerHitbox();
    const previousBottom = p.prevY + p.h;
    const currentBottom = p.y + p.h;
    const horizontalForgiveness = Math.max(0, Number(CFG.gameplay.stompHorizontalForgiveness) || 24);
    const topForgiveness = Math.max(0, Number(CFG.gameplay.stompTopForgiveness) || 18);
    const previousGrace = Math.max(12, Number(CFG.gameplay.stompPreviousBottomGrace) || 46);
    const minDownwardVelocity = Number(CFG.gameplay.stompMinDownwardVelocity) || 20;

    for (const e of game.enemies) {
      if (e.state !== "alive") continue;
      const enemyBox = { x: e.x + 10, y: e.y + 8, w: e.w - 20, h: e.h - 8 };
      const normalOverlap = rectsOverlap(box, enemyBox);

      // 斜め上から降下する場合は、通常の接触判定より踏みつけ判定を優先する。
      // 敵の左右へ少し外れていても、足元が敵の上面を横切れば踏みつけになる。
      const expandedEnemyLeft = enemyBox.x - horizontalForgiveness;
      const expandedEnemyRight = enemyBox.x + enemyBox.w + horizontalForgiveness;
      const horizontalStompRange = box.x + box.w > expandedEnemyLeft && box.x < expandedEnemyRight;
      const crossesEnemyTop = previousBottom <= enemyBox.y + previousGrace && currentBottom >= enemyBox.y - topForgiveness;
      const playerMostlyAbove = p.y + p.h * .58 < e.y + e.h * .82;
      const stomped = p.vy > minDownwardVelocity && horizontalStompRange && crossesEnemyTop && playerMostlyAbove;

      if (stomped) {
        stompEnemy(e);
        break;
      }
      if (!normalOverlap) continue;
      playerHit();
      break;
    }
  }

  function stompEnemy(enemy) {
    enemy.state = "squash";
    enemy.timer = .42;
    game.player.y = enemy.y - game.player.h + 8;
    game.player.vy = CFG.gameplay.stompBounceVelocity;
    game.player.stompTimer = Math.max(.06, Number(CFG.gameplay.stompPoseTime) || .16);
    game.player.grounded = false;
    game.player.jumpsUsed = 1;
    game.combo = game.comboTimer > 0 ? game.combo + 1 : 1;
    game.comboTimer = 1.35;
    const multiplier = 1 + Math.min(6, game.combo - 1) * .25;
    const points = Math.floor(enemy.score * multiplier);
    addScore(points);
    game.hitStop = .058;
    game.shake = 15 + Math.min(game.combo, 5) * 2;
    spawnStompParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h * .58, enemy.type);
    audio.stomp(game.combo);
    if (game.combo >= 2) toast(`${game.combo} COMBO　+${points}`);
  }

  function spawnDust(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      game.particles.push({
        x, y, vx: (Math.random() - .5) * 130, vy: -40 - Math.random() * 80,
        life: .45 + Math.random() * .25, maxLife: .7, size: 7 + Math.random() * 8,
        color, gravity: 140, type: "circle"
      });
    }
  }

  function spawnBurst(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 90 + Math.random() * 210;
      game.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: .42 + Math.random() * .35, maxLife: .8, size: 4 + Math.random() * 7,
        color, gravity: 360, type: i % 3 ? "circle" : "star"
      });
    }
  }

  function spawnStompParticles(x, y, type) {
    const colors = {
      moko: ["#ffd6b8", "#b77450", "#fff3dc"],
      puni: ["#b9ffed", "#43a995", "#ffffff"],
      toge: ["#ffe99a", "#c98b24", "#fff7cc"],
      shizuku: ["#e0c8ff", "#7d58bd", "#ffffff"]
    }[type] || ["#fff", "#80c8aa"];
    spawnBurst(x, y, 22, colors[0]);
    for (let i = 0; i < 10; i++) {
      game.particles.push({
        x, y, vx: (Math.random() - .5) * 380, vy: -70 - Math.random() * 260,
        life: .55 + Math.random() * .35, maxLife: .9, size: 5 + Math.random() * 8,
        color: colors[i % colors.length], gravity: 520, type: i % 2 ? "star" : "circle"
      });
    }
    game.particles.push({ x, y, vx: 0, vy: 0, life: .24, maxLife: .24, size: 25, color: "#ffffff", gravity: 0, type: "ring" });
  }

  function updateParticles(dt) {
    for (const p of game.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.gravity || 0) * dt;
    }
    game.particles = game.particles.filter(p => p.life > 0);
  }

  function draw() {
    const { cssW, cssH, dpr, scale, offX, offY } = game.layout;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#dcefe9";
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.save();
    ctx.translate(offX, offY);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.rect(0, 0, BASE_W, BASE_H);
    ctx.clip();

    const shakeX = game.shake > 0 ? (Math.random() - .5) * game.shake : 0;
    const shakeY = game.shake > 0 ? (Math.random() - .5) * game.shake * .55 : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);

    if (game.state === "title" || game.state === "loading") {
      drawIdleBackdrop();
    } else if (game.state === "ending") {
      drawEndingBackdrop();
    } else if (game.stage) {
      drawStageBackground(game.stage, game.cameraX);
      drawWorld(game.stage, game.cameraX);
    }
    ctx.restore();
    ctx.restore();
  }

  function drawIdleBackdrop() {
    const g = ctx.createLinearGradient(0, 0, 0, BASE_H);
    g.addColorStop(0, "#d8f5ee");
    g.addColorStop(1, "#fff3d9");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, BASE_W, BASE_H);
  }

  function drawStageBackground(stage, cameraX) {
    const t = stage.theme || {};
    if (stage.backgroundImage) {
      const customBackground = getDynamicImage(stage.backgroundImage);
      if (drawCoverImage(customBackground, 0, 0, BASE_W, BASE_H, cameraX * Number(stage.backgroundParallax || 0))) {
        if (!stage.backgroundTint) return;
        ctx.fillStyle = stage.backgroundTint;
        ctx.fillRect(0, 0, BASE_W, BASE_H);
        return;
      }
    }
    const sky = ctx.createLinearGradient(0, 0, 0, BASE_H);
    sky.addColorStop(0, t.skyTop || "#bfeee9");
    sky.addColorStop(1, t.skyBottom || "#fff2cf");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, BASE_W, BASE_H);

    drawSunMoon(t.time);
    drawCloudLayer(cameraX * .08, t.time);
    drawMountainLayer(cameraX * .12, 455, t.hillFar || "#91c9a1", .72);
    drawMountainLayer(cameraX * .22, 520, t.hillNear || "#62a56b", .9);

    if (t.time === "sunset" || t.time === "dusk") drawTown(cameraX * .42, t.time);
    else if (t.time === "forest") drawForest(cameraX * .45);
    else if (t.time === "day") drawRiver(cameraX * .34);
    else drawGarden(cameraX * .42);
  }

  function drawSunMoon(time) {
    ctx.save();
    if (time === "dusk") {
      ctx.fillStyle = "rgba(255,244,196,.92)";
      ctx.shadowColor = "#fff2b0"; ctx.shadowBlur = 28;
      ctx.beginPath(); ctx.arc(1030, 122, 42, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 18; i++) {
        const x = (i * 197 + 51) % BASE_W, y = 35 + (i * 83) % 220;
        ctx.fillStyle = `rgba(255,255,225,${.22 + (i % 3) * .16})`;
        ctx.fillRect(x, y, 2 + i % 2, 2 + i % 2);
      }
    } else {
      const x = time === "sunset" ? 1010 : 1060, y = time === "sunset" ? 165 : 105;
      ctx.fillStyle = time === "sunset" ? "#ffd082" : "#fff3a8";
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 34;
      ctx.beginPath(); ctx.arc(x, y, time === "sunset" ? 54 : 44, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawCloudLayer(offset, time) {
    ctx.save();
    ctx.globalAlpha = time === "dusk" ? .35 : .64;
    for (let i = -1; i < 7; i++) {
      const x = ((i * 260 - offset) % 1820) - 180;
      const y = 90 + (i % 3) * 62;
      ctx.fillStyle = time === "sunset" ? "#ffe1d1" : "#ffffff";
      ctx.beginPath();
      ctx.ellipse(x, y, 70, 25, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 48, y - 15, 52, 34, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 92, y, 64, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawMountainLayer(offset, baseY, color, alpha) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(0, BASE_H);
    for (let x = -220; x <= BASE_W + 260; x += 180) {
      const wx = x - (offset % 180);
      const peak = baseY - 80 - ((x / 180) % 3) * 22;
      ctx.lineTo(wx, baseY);
      ctx.quadraticCurveTo(wx + 90, peak, wx + 180, baseY);
    }
    ctx.lineTo(BASE_W, BASE_H);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawGarden(offset) {
    ctx.save();
    for (let i = -2; i < 18; i++) {
      const x = i * 115 - (offset % 115);
      const y = 545 + (i % 2) * 8;
      ctx.fillStyle = i % 3 ? "#4f9e5e" : "#73b96b";
      ctx.beginPath(); ctx.arc(x, y, 32, 0, Math.PI * 2); ctx.arc(x + 27, y + 6, 25, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = i % 2 ? "#ffe28a" : "#fff4c2";
      ctx.beginPath(); ctx.arc(x + 10, y - 7, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawRiver(offset) {
    ctx.save();
    ctx.fillStyle = "rgba(126,215,225,.55)";
    ctx.fillRect(0, 500, BASE_W, 105);
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.lineWidth = 4;
    for (let i = -1; i < 12; i++) {
      const x = i * 150 - (offset % 150);
      ctx.beginPath(); ctx.moveTo(x, 535 + (i % 3) * 18); ctx.quadraticCurveTo(x + 45, 525, x + 92, 535); ctx.stroke();
    }
    ctx.restore();
  }

  function drawForest(offset) {
    ctx.save();
    for (let i = -2; i < 15; i++) {
      const x = i * 130 - (offset % 130);
      const h = 115 + (i % 4) * 18;
      ctx.fillStyle = "#6c523b"; ctx.fillRect(x + 48, 535 - h * .4, 18, h * .55);
      ctx.fillStyle = i % 2 ? "#38734d" : "#4b8858";
      ctx.beginPath(); ctx.arc(x + 56, 500 - h * .42, h * .34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,223,137,.23)";
      ctx.beginPath(); ctx.arc(x + 38, 483 - h * .42, h * .12, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawTown(offset, time) {
    ctx.save();
    for (let i = -2; i < 15; i++) {
      const x = i * 120 - (offset % 120);
      const h = 72 + (i % 4) * 25;
      ctx.fillStyle = i % 2 ? "#657184" : "#788397";
      ctx.fillRect(x, 530 - h, 94, h);
      ctx.fillStyle = time === "dusk" ? "#ffe6a5" : "#ffd4ae";
      for (let wy = 0; wy < 3; wy++) for (let wx = 0; wx < 3; wx++) {
        if ((i + wx + wy) % 3 !== 0) ctx.fillRect(x + 13 + wx * 25, 545 - h + wy * 24, 10, 13);
      }
    }
    ctx.restore();
  }

  function drawWorld(stage, cameraX) {
    if (stage.tileMap) drawTileMap(stage, cameraX);
    else {
      drawGround(stage, cameraX);
      drawPlatforms(stage, cameraX);
    }
    drawGoal(stage, cameraX);
    drawEnemies(cameraX);
    drawPiyoppi(cameraX);
    drawPlayer(cameraX);
    drawParticles(cameraX);
  }

  function drawTileMap(stage, cameraX) {
    const map = stage.tileMap;
    const size = map.tileSize;
    const firstCol = clamp(Math.floor(cameraX / size) - 1, 0, map.cols - 1);
    const lastCol = clamp(Math.ceil((cameraX + BASE_W) / size) + 1, 0, map.cols - 1);
    for (let row = 0; row < map.rows; row++) {
      for (let col = firstCol; col <= lastCol; col++) {
        const id = map.cells[row]?.[col] || "empty";
        const def = TILE_DEFS[id] || TILE_DEFS.empty;
        if (id === "empty" || def.object) continue;
        const image = assets[`tile_${id}`] || getDynamicImage(def.image);
        const x = col * size - cameraX;
        const y = row * size;
        if (image && image.complete && image.naturalWidth) {
          ctx.drawImage(image, x - .5, y - .5, size + 1, size + 1);
        } else {
          ctx.fillStyle = def.collision === "hazard" || def.collision === "void" ? "#31464b" : def.collision === "solid" ? "#7ea26f" : "rgba(255,255,255,.12)";
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  }

  function drawGround(stage, cameraX) {
    if (stage.tileMap) return;
    const t = stage.theme || {};
    ctx.fillStyle = t.ground || "#c69c68";
    ctx.fillRect(0, GROUND_Y, BASE_W, BASE_H - GROUND_Y);

    const gaps = stage.gaps;
    for (const [a, b] of gaps) {
      const x = a - cameraX;
      if (x > BASE_W || b - cameraX < 0) continue;
      ctx.clearRect(x, GROUND_Y - 2, b - a, BASE_H - GROUND_Y + 4);
      const pit = ctx.createLinearGradient(0, GROUND_Y, 0, BASE_H);
      pit.addColorStop(0, "rgba(44,67,71,.82)");
      pit.addColorStop(1, "rgba(17,31,37,1)");
      ctx.fillStyle = pit;
      ctx.fillRect(x, GROUND_Y, b - a, BASE_H - GROUND_Y);
      ctx.fillStyle = "rgba(255,255,255,.18)";
      ctx.fillRect(x + 9, GROUND_Y + 7, Math.max(0, b - a - 18), 4);
    }
    ctx.fillStyle = t.groundTop || "#75ad64";
    for (let x = -40 - (cameraX % 42); x < BASE_W + 50; x += 42) {
      const worldX = x + cameraX;
      if (!getGroundAvailable(worldX)) continue;
      ctx.beginPath();
      ctx.ellipse(x + 20, GROUND_Y + 2, 27, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,.12)";
    for (let i = 0; i < 80; i++) {
      const x = (i * 89 - cameraX * .9) % (BASE_W + 120);
      const y = GROUND_Y + 24 + (i * 47) % 82;
      ctx.beginPath(); ctx.arc(x, y, 2 + i % 3, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawPlatforms(stage, cameraX) {
    if (stage.tileMap) return;
    for (const p of stage.platforms) {
      const x = Number(p.x) - cameraX;
      const y = Number(p.y), w = Number(p.w);
      if (x > BASE_W + 100 || x + w < -100) continue;
      const g = ctx.createLinearGradient(0, y, 0, y + 35);
      g.addColorStop(0, "#a7d58b");
      g.addColorStop(.18, "#79b569");
      g.addColorStop(.19, "#b98957");
      g.addColorStop(1, "#8b603f");
      ctx.fillStyle = g;
      roundedRect(ctx, x, y, w, 34, 14);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.35)";
      roundedRect(ctx, x + 10, y + 5, w - 20, 5, 3);
      ctx.fill();
    }
  }

  function drawGoal(stage, cameraX) {
    const x = (game.tileRuntime?.goalX || stage.length - 180) - cameraX;
    if (x < -430 || x > BASE_W + 200) return;
    const final = game.stageIndex === game.stages.length - 1;
    ctx.save();
    ctx.translate(x, 0);
    if (final) {
      ctx.fillStyle = "rgba(255,240,178,.22)";
      ctx.shadowColor = "#ffe8a8"; ctx.shadowBlur = 36;
      roundedRect(ctx, -210, 250, 380, 360, 22); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#eef7f4";
      roundedRect(ctx, -190, 285, 340, 325, 18); ctx.fill();
      ctx.fillStyle = "#a7d7ca";
      roundedRect(ctx, -112, 245, 185, 56, 12); ctx.fill();
      ctx.fillStyle = "#176f60";
      ctx.font = '900 23px "Yu Gothic", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("村上記念病院", -20, 281);
      ctx.fillStyle = "#87c6b7";
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
        roundedRect(ctx, -155 + c * 72, 330 + r * 68, 43, 39, 5); ctx.fill();
      }
      ctx.fillStyle = "#4b8b7d";
      roundedRect(ctx, -62, 520, 85, 90, 8); ctx.fill();
      ctx.fillStyle = "#fff2af";
      ctx.globalAlpha = .65 + Math.sin(game.time * 2) * .2;
      roundedRect(ctx, -54, 528, 69, 72, 5); ctx.fill();
    } else {
      ctx.fillStyle = "#fff7de";
      roundedRect(ctx, -45, 360, 90, 250, 20); ctx.fill();
      ctx.fillStyle = "#3aa081";
      roundedRect(ctx, -61, 340, 122, 58, 16); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = '900 22px "Yu Gothic", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("GOAL", 0, 377);
      ctx.fillStyle = "#ffc65a";
      ctx.beginPath(); ctx.arc(0, 328, 20 + Math.sin(game.time * 4) * 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawEnemies(cameraX) {
    for (const e of game.enemies) {
      if (e.state === "dead") continue;
      const x = e.x - cameraX;
      if (x < -130 || x > BASE_W + 130) continue;
      const enemyCfg = CFG.assets.enemies[e.type] || {};
      const walkCount = Math.max(1, Array.isArray(enemyCfg.walk) ? enemyCfg.walk.length : 1);
      const frame = Math.floor(e.animTime * 7) % walkCount;
      const image = e.state === "squash"
        ? (assets[`enemy_${e.type}_defeated`] || assets[`enemy_${e.type}_walk_0`])
        : assets[`enemy_${e.type}_walk_${frame}`];
      const bob = e.state === "alive" ? Math.sin(e.animTime * 7 + e.phase) * 3 : 0;
      let sx = 1, sy = 1, y = e.y + bob;
      if (e.state === "squash") {
        const progress = 1 - clamp(e.timer / .42, 0, 1);
        sx = 1 + Math.sin(progress * Math.PI) * .12;
        sy = 1 - Math.sin(progress * Math.PI) * .08;
        y = e.y + 8;
      }
      ctx.save();
      ctx.translate(x + e.w / 2, y + e.h);
      ctx.scale(sx * e.direction, sy);
      if (image) ctx.drawImage(image, -e.w / 2, -e.h, e.w, e.h);
      else {
        ctx.fillStyle = "#8ec8a8";
        ctx.beginPath(); ctx.arc(0, -e.h / 2, e.w / 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawPlayer(cameraX) {
    const p = game.player;
    const x = p.x - cameraX;
    const flicker = p.invuln > 0 && Math.floor(p.invuln * 14) % 2 === 0;
    if (flicker) ctx.globalAlpha = .38;
    let image;
    if (game.state === "dying") image = assets.murappiDefeated || assets.murappiHurt || assets.murappiIdle;
    else if (p.hurtTimer > 0) image = assets.murappiHurt;
    else if (p.stompTimer > 0) image = assets.murappiStomp || assets.murappiJump;
    else if (!p.grounded) image = assets.murappiJump;
    else image = assets[`murappiRun${Math.floor(p.runFrame) % CFG.assets.murappi.run.length}`] || assets.murappiIdle;

    const drawH = game.state === "dying" ? 174 : (!p.grounded ? 176 : 168 + Math.sin(p.runFrame * Math.PI) * 3);
    const ratio = image ? image.width / image.height : .5;
    const drawW = drawH * ratio;
    const tilt = game.state === "dying"
      ? p.deathSpin
      : p.hurtTimer > 0 ? -10 : !p.grounded ? clamp(p.vy / 110, -7, 10) : Math.sin(p.runFrame * Math.PI) * 1.6;
    ctx.save();
    ctx.translate(x + p.w / 2, p.y + p.h);
    ctx.rotate(tilt * Math.PI / 180);
    ctx.shadowColor = "rgba(43,43,30,.18)";
    ctx.shadowBlur = 10; ctx.shadowOffsetY = 7;
    if (image) ctx.drawImage(image, -drawW / 2, -drawH, drawW, drawH);
    else { ctx.fillStyle = "#176f60"; ctx.fillRect(-35, -155, 70, 155); }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawPiyoppi(cameraX) {
    const state = getPiyoppiTrailState();
    if (!state) return;

    const frameCount = Math.max(1, CFG.assets.piyoppi.hop.length);
    const walkFrame = Math.floor(state.runFrame * .46) % frameCount;
    const airFrame = Math.min(frameCount - 1, 1);
    const image = assets[`piyoppiHop${state.grounded ? walkFrame : airFrame}`] || assets.piyoppiIdle;
    if (!image) return;

    const x = state.x + PLAYER_W * .50 - cameraX;
    const footY = state.footY;
    const h = 70;
    const w = h * image.width / image.height;
    const step = Math.sin(state.runFrame * Math.PI);
    const scaleY = state.grounded ? 1 + step * .012 : 1;
    const scaleX = state.grounded ? 1 - step * .008 : 1;
    const tilt = state.grounded ? step * .018 : clamp(state.vy / 1500, -.07, .08);

    // 地上では影と足元を同じY座標へ固定し、上下のホッピングを行わない。
    // これにより、ぴよっぴが浮かずに地面を歩いて見える。
    if (state.grounded) {
      ctx.save();
      ctx.globalAlpha = .20;
      ctx.fillStyle = "#6b573b";
      ctx.beginPath();
      ctx.ellipse(x, footY + 2, 24, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(x, footY);
    ctx.rotate(tilt);
    ctx.scale(scaleX, scaleY);
    ctx.shadowColor = "rgba(79,55,20,.16)";
    ctx.shadowBlur = state.grounded ? 5 : 8;
    ctx.shadowOffsetY = state.grounded ? 2 : 5;
    ctx.drawImage(image, -w / 2, -h, w, h);
    ctx.restore();
  }

  function drawParticles(cameraX) {
    for (const p of game.particles) {
      const alpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x - cameraX, p.y);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      if (p.type === "ring") {
        const r = p.size * (1 + (1 - alpha) * 3.5);
        ctx.lineWidth = 5 * alpha;
        ctx.beginPath(); ctx.ellipse(0, 0, r * 1.5, r * .45, 0, 0, Math.PI * 2); ctx.stroke();
      } else if (p.type === "star") {
        drawStar(0, 0, p.size, p.size * .45, 5);
        ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(0, 0, p.size * alpha, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawEndingBackdrop() {
    const g = ctx.createLinearGradient(0, 0, 0, BASE_H);
    g.addColorStop(0, "#385c84");
    g.addColorStop(.58, "#f0a981");
    g.addColorStop(1, "#254d49");
    ctx.fillStyle = g; ctx.fillRect(0, 0, BASE_W, BASE_H);
    ctx.fillStyle = "rgba(255,236,175,.88)";
    ctx.shadowColor = "#ffe8a6"; ctx.shadowBlur = 50;
    ctx.beginPath(); ctx.arc(1030, 130, 52, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    drawTown(game.time * 8, "dusk");
    ctx.fillStyle = "#2c5e52"; ctx.fillRect(0, 610, BASE_W, 110);

    ctx.save();
    ctx.translate(760, 0);
    ctx.fillStyle = "#edf6f3";
    roundedRect(ctx, -210, 260, 390, 350, 22); ctx.fill();
    ctx.fillStyle = "#9ed5c7"; roundedRect(ctx, -112, 220, 200, 58, 14); ctx.fill();
    ctx.fillStyle = "#176f60"; ctx.font = '900 24px "Yu Gothic", sans-serif'; ctx.textAlign = "center";
    ctx.fillText("村上記念病院", -12, 258);
    ctx.fillStyle = "#ffe7a5";
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) roundedRect(ctx, -170 + c * 80, 315 + r * 68, 48, 40, 6), ctx.fill();
    ctx.fillStyle = "#4f8e80"; roundedRect(ctx, -60, 515, 95, 95, 8); ctx.fill();
    ctx.restore();

    if (assets.murappiIdle) {
      const h = 190, w = h * assets.murappiIdle.width / assets.murappiIdle.height;
      ctx.drawImage(assets.murappiIdle, 300 - w / 2, 610 - h, w, h);
    }
    if (assets.piyoppiIdle) {
      const h = 82, w = h * assets.piyoppiIdle.width / assets.piyoppiIdle.height;
      ctx.drawImage(assets.piyoppiIdle, 405 - w / 2, 610 - h, w, h);
    }
  }

  function roundedRect(context, x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + w, y, x + w, y + h, radius);
    context.arcTo(x + w, y + h, x, y + h, radius);
    context.arcTo(x, y + h, x, y, radius);
    context.arcTo(x, y, x + w, y, radius);
    context.closePath();
  }

  function drawStar(x, y, outer, inner, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const a = -Math.PI / 2 + i * Math.PI / points;
      const r = i % 2 ? inner : outer;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function loop(now) {
    const dt = Math.min(.04, Math.max(0, (now - game.frameTime) / 1000));
    game.frameTime = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function openModal(which) {
    ui.modalBackdrop.classList.remove("is-hidden");
    ui.installModal.classList.toggle("is-hidden", which !== "install");
    ui.rankingModal.classList.toggle("is-hidden", which !== "ranking");
    ui.editorModal.classList.toggle("is-hidden", which !== "editor");
  }

  function closeModal() {
    ui.modalBackdrop.classList.add("is-hidden");
    ui.installModal.classList.add("is-hidden");
    ui.rankingModal.classList.add("is-hidden");
    ui.editorModal.classList.add("is-hidden");
  }

  async function renderRanking() {
    const local = storage.getJSON(CFG.storageKeys.ranking, []);
    ui.rankingList.innerHTML = "";
    const rows = local.length ? local : [{ score: game.highScore, date: new Date().toISOString(), clearedStages: 0 }];
    rows.slice(0, 10).forEach((row) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${row.clearedStages >= game.stages.length ? "全クリア" : `${row.clearedStages || 0}面`}</span><strong>${padScore(row.score)}</strong><small>${fmtDate(row.date)}</small>`;
      ui.rankingList.appendChild(li);
    });
    openModal("ranking");

    if (CFG.leaderboard.endpoint) {
      try {
        const response = await fetch(CFG.leaderboard.endpoint);
        if (!response.ok) throw new Error("HTTP " + response.status);
        const remote = await response.json();
        if (Array.isArray(remote)) {
          ui.rankingList.innerHTML = "";
          remote.slice(0, 20).forEach((row) => {
            const li = document.createElement("li");
            li.innerHTML = `<span>${escapeHtml(row.name || "PLAYER")}</span><strong>${padScore(row.score)}</strong><small>${fmtDate(row.date)}</small>`;
            ui.rankingList.appendChild(li);
          });
        }
      } catch (error) {
        toast("共通ランキングへ接続できませんでした");
      }
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
  }

  function collisionLabel(collision) {
    return {
      none: "通過する背景",
      void: "足場なし・画面外まで落ちるとミス",
      platform: "上に乗れる",
      solid: "上に乗れる・横からぶつかる",
      hazard: "接触するとダメージ",
      object: "ゲーム内オブジェクト"
    }[collision] || "判定なし";
  }

  function renderTilePalette() {
    ui.tilePalette.innerHTML = "";
    Object.entries(TILE_DEFS).forEach(([id, def]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tile-button";
      button.dataset.tileId = id;
      button.dataset.collision = def.collision;
      button.title = `${def.label}：${collisionLabel(def.collision)}`;

      if (id === "empty") {
        const preview = document.createElement("span");
        preview.className = "tile-eraser-preview";
        preview.textContent = "×";
        button.appendChild(preview);
      } else {
        const image = document.createElement("img");
        image.src = def.image || "";
        image.alt = "";
        button.appendChild(image);
      }

      const label = document.createElement("span");
      label.textContent = def.label || id;
      button.appendChild(label);

      if (def.custom) {
        const customMark = document.createElement("b");
        customMark.className = "custom-mark";
        customMark.textContent = "追加";
        button.appendChild(customMark);
      }

      const collisionMark = document.createElement("small");
      button.appendChild(collisionMark);
      button.addEventListener("click", () => selectEditorTile(id));
      ui.tilePalette.appendChild(button);
    });

    if (!TILE_DEFS[editor.selectedTile]) editor.selectedTile = "empty";
    selectEditorTile(editor.selectedTile);
  }

  function setPatternPreview(src) {
    if (src) {
      ui.patternPreview.src = src;
      ui.patternPreview.style.display = "block";
      ui.patternPreviewEmpty.style.display = "none";
    } else {
      ui.patternPreview.removeAttribute("src");
      ui.patternPreview.style.display = "none";
      ui.patternPreviewEmpty.style.display = "block";
    }
  }

  function showPatternFormFor(id) {
    const def = TILE_DEFS[id];
    if (!def) return;
    editor.patternEditingId = id;
    editor.patternPendingImage = "";
    editor.patternPendingFileName = "";
    ui.patternImageInput.value = "";
    ui.patternNameInput.value = def.label || "";
    ui.patternCategoryInput.value = def.category || "";
    ui.patternCollisionSelect.value = ["none", "platform", "solid", "void", "hazard"].includes(def.collision) ? def.collision : "none";
    ui.patternImageName.textContent = def.image ? "現在の画像を使用中。変更する場合は画像を選択してください。" : "画像が設定されていません。";
    setPatternPreview(def.image || "");

    const locked = Boolean(def.locked || def.object || id === "empty");
    ui.patternForm.classList.toggle("is-locked", locked);
    ui.deletePattern.disabled = locked;
    ui.savePattern.disabled = locked;
    ui.patternFormNote.textContent = locked
      ? "このパターンは敵・スタート・ゴールなどのシステム用です。ゲーム進行に必要なため編集・削除できません。"
      : "画像、名称、分類、当たり判定を変更できます。変更内容はこの端末内へ保存されます。";
  }

  function beginNewPattern() {
    editor.patternEditingId = null;
    editor.patternPendingImage = "";
    editor.patternPendingFileName = "";
    ui.patternManager.open = true;
    ui.patternForm.classList.remove("is-locked");
    ui.patternNameInput.value = "";
    ui.patternCategoryInput.value = "背景";
    ui.patternCollisionSelect.value = "none";
    ui.patternImageInput.value = "";
    ui.patternImageName.textContent = "PNG・WebP・JPEG／最大8MB";
    ui.patternFormNote.textContent = "新しいパターンです。画像と名称を設定して「設定を保存」を押してください。";
    ui.deletePattern.disabled = true;
    ui.savePattern.disabled = false;
    setPatternPreview("");
    ui.patternNameInput.focus();
  }

  function selectEditorTile(id) {
    if (!TILE_DEFS[id]) return;
    editor.selectedTile = id;
    ui.tilePalette.querySelectorAll(".tile-button").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.tileId === id);
    });
    const def = TILE_DEFS[id];
    const kind = def.custom ? "追加パターン" : def.locked ? "システムパターン" : "標準パターン";
    ui.selectedTileInfo.innerHTML = `<strong>${escapeHtml(def.label)}</strong><br>${collisionLabel(def.collision)}<br><small>${kind}</small>`;
    showPatternFormFor(id);
  }

  function makePatternId() {
    return `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function loadImageElement(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("画像を読み込めませんでした。"));
      image.src = src;
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("画像ファイルを読み込めませんでした。"));
      reader.readAsDataURL(file);
    });
  }

  async function preparePatternImage(file) {
    if (!file) return "";
    if (!/^image\/(png|webp|jpeg)$/.test(file.type)) throw new Error("PNG・WebP・JPEG画像を選択してください。");
    if (file.size > 8 * 1024 * 1024) throw new Error("画像は8MB以下にしてください。");

    const original = await readFileAsDataUrl(file);
    const image = await loadImageElement(original);
    const maxSide = 512;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const output = document.createElement("canvas");
    output.width = Math.max(1, Math.round(image.naturalWidth * scale));
    output.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const outputCtx = output.getContext("2d");
    outputCtx.clearRect(0, 0, output.width, output.height);
    outputCtx.drawImage(image, 0, 0, output.width, output.height);
    const webp = output.toDataURL("image/webp", .9);
    return webp.startsWith("data:image/webp") ? webp : output.toDataURL("image/png");
  }

  function invalidateTileImage(id, previousSrc = "") {
    delete assets[`tile_${id}`];
    if (previousSrc) dynamicImages.delete(previousSrc);
  }

  async function savePatternDefinition() {
    try {
      const name = String(ui.patternNameInput.value || "").trim();
      const category = String(ui.patternCategoryInput.value || "その他").trim() || "その他";
      const collision = ui.patternCollisionSelect.value;
      if (!name) throw new Error("パターン名を入力してください。");
      if (!["none", "platform", "solid", "void", "hazard"].includes(collision)) throw new Error("当たり判定が不正です。");

      const existingId = editor.patternEditingId;
      const existing = existingId ? TILE_DEFS[existingId] : null;
      if (existing?.locked || existing?.object || existingId === "empty") throw new Error("このパターンは編集できません。");
      const id = existingId || makePatternId();
      const image = editor.patternPendingImage || existing?.image || "";
      if (!image) throw new Error("パターン画像を選択してください。");

      const record = {
        id,
        label: name,
        category,
        collision,
        image,
        custom: !BASE_TILE_DEFS[id],
        deleted: false,
        updatedAt: new Date().toISOString()
      };
      await patternStore.put(record);
      const previousSrc = existing?.image || "";
      TILE_DEFS[id] = {
        ...(BASE_TILE_DEFS[id] ? deepClone(BASE_TILE_DEFS[id]) : {}),
        ...record,
        locked: false,
        object: undefined,
        id
      };
      invalidateTileImage(id, previousSrc);
      editor.selectedTile = id;
      renderTilePalette();
      drawEditorMap();
      refreshEditorJson();
      ui.patternManager.open = true;
      ui.editorStatus.style.color = "#176f60";
      ui.editorStatus.textContent = existing ? "パターン設定を更新しました。" : "新しいパターンを追加しました。";
      toast(existing ? "パターンを更新しました" : "パターンを追加しました");
    } catch (error) {
      ui.editorStatus.style.color = "#a44141";
      ui.editorStatus.textContent = error.message;
    }
  }

  function replacePatternInStages(patternId, replacement = "empty") {
    for (const stage of editor.stages) {
      if (!stage?.tileMap?.cells) continue;
      for (const row of stage.tileMap.cells) {
        for (let i = 0; i < row.length; i++) {
          if (row[i] === patternId) row[i] = replacement;
        }
      }
      ensureRequiredMarkers(stage);
    }
  }

  async function deletePatternDefinition() {
    const id = editor.patternEditingId;
    const def = id ? TILE_DEFS[id] : null;
    if (!def || def.locked || def.object || id === "empty") return;
    const ok = window.confirm(`「${def.label}」を削除しますか？
全ステージに配置済みの同パターンも消去されます。`);
    if (!ok) return;

    const previousSrc = def.image || "";
    if (BASE_TILE_DEFS[id]) {
      await patternStore.put({ id, deleted: true, updatedAt: new Date().toISOString() });
    } else {
      await patternStore.remove(id);
    }
    delete TILE_DEFS[id];
    invalidateTileImage(id, previousSrc);
    replacePatternInStages(id, "empty");
    storage.setJSON(CFG.storageKeys.customStages, normalizeStages(editor.stages));
    game.stages = normalizeStages(deepClone(editor.stages));
    editor.selectedTile = "empty";
    renderTilePalette();
    drawEditorMap();
    refreshEditorJson();
    ui.editorStatus.style.color = "#176f60";
    ui.editorStatus.textContent = "パターンを削除し、全ステージ上の配置も消去しました。";
    toast("パターンを削除しました");
  }

  async function resetPatternDefinitions() {
    const ok = window.confirm(`追加・変更・削除したパターンをすべて破棄し、標準状態へ戻しますか？
追加パターンを配置したマスは消去されます。`);
    if (!ok) return;
    await patternStore.clear();
    resetTileDefinitionsToBase();
    Object.keys(assets).filter((key) => key.startsWith("tile_")).forEach((key) => delete assets[key]);
    dynamicImages.clear();
    for (const stage of editor.stages) {
      if (!stage?.tileMap?.cells) continue;
      for (const row of stage.tileMap.cells) {
        for (let i = 0; i < row.length; i++) {
          if (!TILE_DEFS[row[i]]) row[i] = "empty";
        }
      }
      ensureRequiredMarkers(stage);
    }
    storage.setJSON(CFG.storageKeys.customStages, normalizeStages(editor.stages));
    game.stages = normalizeStages(deepClone(editor.stages));
    editor.selectedTile = TILE_DEFS.ground_grass ? "ground_grass" : "empty";
    renderTilePalette();
    drawEditorMap();
    refreshEditorJson();
    ui.editorStatus.style.color = "#176f60";
    ui.editorStatus.textContent = "パターンを標準状態へ戻しました。";
    toast("標準パターンを復元しました");
  }

  function currentEditorStage() {
    return editor.stages[editor.stageIndex];
  }

  function ensureRequiredMarkers(stage) {
    const map = stage.tileMap;
    let hasStart = false, hasGoal = false;
    for (const row of map.cells) {
      for (const id of row) {
        if (id === "start") hasStart = true;
        if (id === "goal") hasGoal = true;
      }
    }
    if (!hasStart) map.cells[Math.max(0, map.rows - 2)][1] = "start";
    if (!hasGoal) map.cells[Math.max(0, map.rows - 2)][Math.max(2, map.cols - 2)] = "goal";
  }

  function createBlankEditorStage() {
    const source = currentEditorStage() || normalizeStages(deepClone(DEFAULT_STAGES))[0];
    const rows = TILE_CFG.rows;
    const cols = Math.max(TILE_CFG.minColumns, 32);
    const cells = makeBlankCells(rows, cols);
    const groundId = TILE_DEFS.ground_grass ? "ground_grass" : Object.keys(TILE_DEFS).find((id) => TILE_DEFS[id]?.collision === "solid") || "empty";
    for (let col = 0; col < cols; col++) cells[rows - 1][col] = groundId;
    cells[Math.max(0, rows - 2)][1] = "start";
    cells[Math.max(0, rows - 2)][Math.max(2, cols - 2)] = "goal";
    return convertLegacyStage({
      title: `新規ステージ${editor.stages.length + 1}`,
      subtitle: "下書きステージ",
      speed: Number(source?.speed) || CFG.gameplay.basePlayerSpeed,
      theme: deepClone(source?.theme || DEFAULT_STAGES[0]?.theme || {}),
      includeInGame: false,
      draft: true,
      length: cols * TILE_CFG.tileSize,
      enemies: [],
      gaps: [],
      platforms: [],
      tileMap: { tileSize: TILE_CFG.tileSize, rows, cols, cells }
    }, editor.stages.length);
  }

  function newEditorStage() {
    if (editor.ready) syncEditorMetaToStage();
    editor.stages.push(createBlankEditorStage());
    editor.stageIndex = editor.stages.length - 1;
    editor.ready = false;
    populateEditorStageSelect();
    loadEditorStage(editor.stageIndex);
    saveEditorStages(true);
    ui.editorStatus.style.color = "#176f60";
    ui.editorStatus.textContent = "新しいステージを下書きとして作成・保存しました。";
    toast("新規ステージを作成しました");
  }

  function deleteEditorStage() {
    if (editor.stages.length <= 1) {
      toast("最後の1ステージは削除できません");
      return;
    }
    const stage = currentEditorStage();
    if (!window.confirm(`「${stage.title}」を削除しますか？`)) return;
    editor.stages.splice(editor.stageIndex, 1);
    editor.stageIndex = clamp(editor.stageIndex, 0, editor.stages.length - 1);
    editor.ready = false;
    populateEditorStageSelect();
    loadEditorStage(editor.stageIndex);
    saveEditorStages(true);
    ui.editorStatus.style.color = "#176f60";
    ui.editorStatus.textContent = "ステージを削除しました。";
    toast("ステージを削除しました");
  }

  function saveCurrentStageAsDraft() {
    syncEditorMetaToStage();
    const stage = currentEditorStage();
    stage.includeInGame = false;
    stage.draft = true;
    if (ui.editorIncludeInput) ui.editorIncludeInput.value = "false";
    if (!saveEditorStages(true)) return;
    populateEditorStageSelect();
    ui.editorStageSelect.value = String(editor.stageIndex);
    ui.editorStatus.style.color = "#176f60";
    ui.editorStatus.textContent = "一時保存しました。このステージはゲーム本編には入りません。";
    toast("下書きとして一時保存しました");
  }

  function syncEditorMetaToStage() {
    const stage = currentEditorStage();
    if (!stage) return;
    stage.title = String(ui.editorTitleInput.value || `ステージ${editor.stageIndex + 1}`).trim();
    stage.speed = clamp(Number(ui.editorSpeedInput.value) || CFG.gameplay.basePlayerSpeed, 180, 480);
    stage.includeInGame = ui.editorIncludeInput ? ui.editorIncludeInput.value !== "false" : stage.includeInGame !== false;
    stage.draft = !stage.includeInGame;
    stage.length = stage.tileMap.cols * stage.tileMap.tileSize;
  }

  function refreshEditorJson() {
    syncEditorMetaToStage();
    ui.stageEditor.value = JSON.stringify(editor.stages, null, 2);
  }

  function resizeEditorColumns(stage, requestedColumns) {
    const map = stage.tileMap;
    const newCols = clamp(Math.floor(Number(requestedColumns) || map.cols), TILE_CFG.minColumns, TILE_CFG.maxColumns);
    if (newCols === map.cols) return;
    pushEditorHistory();
    for (let row = 0; row < map.rows; row++) {
      if (newCols > map.cols) map.cells[row].push(...Array(newCols - map.cols).fill("empty"));
      else map.cells[row].length = newCols;
    }
    map.cols = newCols;
    stage.length = newCols * map.tileSize;
    ensureRequiredMarkers(stage);
    ui.editorColumnsInput.value = String(newCols);
    drawEditorMap();
    refreshEditorJson();
  }

  function loadEditorStage(index) {
    if (!editor.stages.length) return;
    if (editor.ready) syncEditorMetaToStage();
    editor.stageIndex = clamp(Number(index) || 0, 0, editor.stages.length - 1);
    const stage = currentEditorStage();
    stage.tileMap = normalizeTileMap(stage.tileMap);
    ensureRequiredMarkers(stage);
    ui.editorStageSelect.value = String(editor.stageIndex);
    ui.editorTitleInput.value = stage.title;
    ui.editorSpeedInput.value = String(stage.speed || CFG.gameplay.basePlayerSpeed);
    ui.editorColumnsInput.value = String(stage.tileMap.cols);
    if (ui.editorIncludeInput) ui.editorIncludeInput.value = stage.includeInGame === false ? "false" : "true";
    editor.history = [];
    editor.ready = true;
    drawEditorMap();
    refreshEditorJson();
    requestAnimationFrame(() => { ui.mapEditorScroll.scrollLeft = 0; });
  }

  function pushEditorHistory() {
    const stage = currentEditorStage();
    if (!stage) return;
    editor.history.push(JSON.stringify({
      tileMap: stage.tileMap,
      title: stage.title,
      speed: stage.speed,
      includeInGame: stage.includeInGame !== false
    }));
    if (editor.history.length > 40) editor.history.shift();
    ui.undoEditor.disabled = false;
  }

  function undoEditor() {
    const snapshot = editor.history.pop();
    if (!snapshot) return;
    const restored = JSON.parse(snapshot);
    const stage = currentEditorStage();
    stage.tileMap = normalizeTileMap(restored.tileMap);
    stage.title = restored.title;
    stage.speed = restored.speed;
    stage.includeInGame = restored.includeInGame !== false;
    stage.draft = !stage.includeInGame;
    ui.editorTitleInput.value = stage.title;
    ui.editorSpeedInput.value = String(stage.speed);
    ui.editorColumnsInput.value = String(stage.tileMap.cols);
    if (ui.editorIncludeInput) ui.editorIncludeInput.value = stage.includeInGame ? "true" : "false";
    ui.undoEditor.disabled = editor.history.length === 0;
    drawEditorMap();
    refreshEditorJson();
  }

  function clearUniqueObject(stage, tileId) {
    if (tileId !== "start" && tileId !== "goal") return;
    for (let row = 0; row < stage.tileMap.rows; row++) {
      for (let col = 0; col < stage.tileMap.cols; col++) {
        if (stage.tileMap.cells[row][col] === tileId) stage.tileMap.cells[row][col] = "empty";
      }
    }
  }

  function paintEditorCell(row, col) {
    const stage = currentEditorStage();
    if (!stage || row < 0 || col < 0 || row >= stage.tileMap.rows || col >= stage.tileMap.cols) return;
    const key = `${row}:${col}:${editor.selectedTile}`;
    if (key === editor.lastCellKey) return;
    editor.lastCellKey = key;
    clearUniqueObject(stage, editor.selectedTile);
    stage.tileMap.cells[row][col] = editor.selectedTile;
    drawEditorMap();
  }

  function editorCellFromPointer(event) {
    const rect = ui.mapEditorCanvas.getBoundingClientRect();
    const scaleX = ui.mapEditorCanvas.width / rect.width;
    const scaleY = ui.mapEditorCanvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const size = TILE_CFG.editorCellSize;
    return { col: Math.floor(x / size), row: Math.floor(y / size) };
  }

  function drawEditorMap() {
    const stage = currentEditorStage();
    if (!stage || !editor.ctx) return;
    const map = stage.tileMap;
    const cell = TILE_CFG.editorCellSize;
    const ec = editor.ctx;
    ui.mapEditorCanvas.width = map.cols * cell;
    ui.mapEditorCanvas.height = map.rows * cell;
    ui.mapEditorCanvas.style.width = `${map.cols * cell}px`;
    ui.mapEditorCanvas.style.height = `${map.rows * cell}px`;
    ec.clearRect(0, 0, ui.mapEditorCanvas.width, ui.mapEditorCanvas.height);

    for (let row = 0; row < map.rows; row++) {
      for (let col = 0; col < map.cols; col++) {
        const x = col * cell, y = row * cell;
        const id = map.cells[row][col] || "empty";
        const def = TILE_DEFS[id] || TILE_DEFS.empty;
        ec.fillStyle = (row + col) % 2 ? "#e7f3ef" : "#f4faf7";
        ec.fillRect(x, y, cell, cell);
        const image = assets[`tile_${id}`] || (def.image ? getDynamicImage(def.image) : null);
        if (id !== "empty" && image && image.complete && image.naturalWidth) {
          if (def.object) {
            ec.save();
            ec.fillStyle = "rgba(112,82,159,.14)";
            ec.fillRect(x + 2, y + 2, cell - 4, cell - 4);
            const pad = 8;
            ec.drawImage(image, x + pad, y + pad, cell - pad * 2, cell - pad * 2);
            ec.restore();
          } else {
            ec.drawImage(image, x, y, cell, cell);
          }
        }
        const collisionColor = {
          none: "#8eb8dc",
          void: "#536b78",
          platform: "#e0ad3c",
          solid: "#2e9b70",
          hazard: "#d95f5f",
          object: "#8a67c4"
        }[def.collision] || "#aab7b3";
        ec.fillStyle = collisionColor;
        ec.fillRect(x + 1, y + cell - 5, cell - 2, 4);
        ec.strokeStyle = "rgba(47,91,78,.22)";
        ec.lineWidth = 1;
        ec.strokeRect(x + .5, y + .5, cell - 1, cell - 1);
        if (def.object) {
          ec.fillStyle = "rgba(27,52,47,.82)";
          ec.font = '800 9px "Yu Gothic", sans-serif';
          ec.textAlign = "center";
          ec.fillText(def.label.replace("敵：", ""), x + cell / 2, y + cell - 8);
        }
      }
    }
  }

  function applyEditorJson() {
    try {
      const parsed = JSON.parse(ui.stageEditor.value);
      validateStages(parsed);
      editor.stages = normalizeStages(deepClone(parsed));
      editor.ready = false;
      populateEditorStageSelect();
      loadEditorStage(Math.min(editor.stageIndex, editor.stages.length - 1));
      ui.editorStatus.style.color = "#176f60";
      ui.editorStatus.textContent = "JSONをマップへ反映しました。";
    } catch (error) {
      ui.editorStatus.style.color = "#a44141";
      ui.editorStatus.textContent = error.message;
    }
  }

  function populateEditorStageSelect() {
    ui.editorStageSelect.innerHTML = "";
    editor.stages.forEach((stage, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${index + 1}面：${stage.title}${stage.includeInGame === false ? "［下書き］" : ""}`;
      ui.editorStageSelect.appendChild(option);
    });
  }

  function refreshCurrentStageOptionLabel() {
    const stage = currentEditorStage();
    const option = ui.editorStageSelect.options[editor.stageIndex];
    if (stage && option) option.textContent = `${editor.stageIndex + 1}面：${stage.title}${stage.includeInGame === false ? "［下書き］" : ""}`;
  }

  function openEditor() {
    game.state = "editor";
    game.testMode = false;
    game.death = null;
    audio.stopBgm();
    ui.hud.classList.add("is-hidden");
    ui.message.classList.add("is-hidden");
    game.stages = loadStages();
    editor.stages = normalizeStages(deepClone(loadAllStages()));
    editor.stageIndex = 0;
    editor.history = [];
    editor.ready = false;
    ui.undoEditor.disabled = true;
    ui.editorStatus.textContent = "";
    renderTilePalette();
    populateEditorStageSelect();
    loadEditorStage(0);
    openModal("editor");
  }

  function saveEditorStages(silent = false) {
    try {
      syncEditorMetaToStage();
      editor.stages = normalizeStages(editor.stages);
      validateStages(editor.stages);
      storage.setJSON(CFG.storageKeys.customStages, editor.stages);
      game.stages = deepClone(editor.stages.filter((stage) => stage.includeInGame !== false));
      refreshEditorJson();
      ui.editorStatus.style.color = "#176f60";
      ui.editorStatus.textContent = "保存しました。次回プレイから反映されます。";
      if (!silent) toast("ステージ設定を保存しました");
      return true;
    } catch (error) {
      ui.editorStatus.style.color = "#a44141";
      ui.editorStatus.textContent = error.message;
      return false;
    }
  }

  async function exportStages() {
    try {
      syncEditorMetaToStage();
      validateStages(editor.stages);
      const patterns = await patternStore.all();
      const bundle = {
        format: "go-murappi-stage-bundle-v1",
        version: CFG.version,
        exportedAt: new Date().toISOString(),
        stages: editor.stages,
        patterns
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "go_murappi_stage_and_patterns.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      ui.editorStatus.style.color = "#176f60";
      ui.editorStatus.textContent = "ステージと追加パターンを一式で書き出しました。";
    } catch (error) {
      ui.editorStatus.style.color = "#a44141";
      ui.editorStatus.textContent = error.message;
    }
  }

  function importStages(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result);
        const importedStages = Array.isArray(parsed) ? parsed : parsed?.stages;
        const importedPatterns = Array.isArray(parsed?.patterns) ? parsed.patterns : null;
        if (importedPatterns) {
          await patternStore.replaceAll(importedPatterns);
          applyPatternRecords(importedPatterns);
          Object.keys(assets).filter((key) => key.startsWith("tile_")).forEach((key) => delete assets[key]);
          dynamicImages.clear();
        }
        validateStages(importedStages);
        editor.stages = normalizeStages(deepClone(importedStages));
        editor.ready = false;
        populateEditorStageSelect();
        renderTilePalette();
        loadEditorStage(0);
        ui.editorStatus.style.color = "#176f60";
        ui.editorStatus.textContent = importedPatterns
          ? "ステージとパターンを読み込みました。「全ステージを保存」でマップを確定してください。"
          : "旧形式のステージを読み込みました。「全ステージを保存」で確定してください。";
      } catch (error) {
        ui.editorStatus.style.color = "#a44141";
        ui.editorStatus.textContent = error.message;
      } finally {
        ui.importStages.value = "";
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function fillEditorGround() {
    const stage = currentEditorStage();
    if (!stage) return;
    pushEditorHistory();
    const row = stage.tileMap.rows - 1;
    const selectedDef = TILE_DEFS[editor.selectedTile];
    const fillId = selectedDef?.collision === "solid"
      ? editor.selectedTile
      : TILE_DEFS.ground_grass
        ? "ground_grass"
        : Object.keys(TILE_DEFS).find((id) => TILE_DEFS[id]?.collision === "solid") || "empty";
    for (let col = 0; col < stage.tileMap.cols; col++) stage.tileMap.cells[row][col] = fillId;
    drawEditorMap();
    refreshEditorJson();
  }

  function clearEditorMap() {
    const stage = currentEditorStage();
    if (!stage) return;
    pushEditorHistory();
    stage.tileMap.cells = makeBlankCells(stage.tileMap.rows, stage.tileMap.cols);
    ensureRequiredMarkers(stage);
    drawEditorMap();
    refreshEditorJson();
    toast("マップを消去しました。必要なら「1つ戻す」で復元できます");
  }

  function testEditorStage() {
    syncEditorMetaToStage();
    const stageSnapshot = normalizeStages([deepClone(currentEditorStage())]);
    try {
      validateStages(stageSnapshot);
    } catch (error) {
      ui.editorStatus.style.color = "#a44141";
      ui.editorStatus.textContent = error.message;
      return;
    }
    closeModal();
    game.score = 0;
    game.lives = CFG.gameplay.startingLives;
    game.hp = CFG.gameplay.maxHp;
    game.testMode = true;
    game.testStageSnapshot = stageSnapshot[0];
    loadStage(0, true, stageSnapshot);
    toast("この面をテスト中");
  }

  async function shareScore() {
    const text = `「GO！むらっぴ」で ${game.score.toLocaleString("ja-JP")} 点！ むらっぴとぴよっぴが村上記念病院へ到着しました。`;
    try {
      if (navigator.share) await navigator.share({ title: "GO！むらっぴ", text });
      else {
        await navigator.clipboard.writeText(text);
        toast("スコア文をコピーしました");
      }
    } catch {}
  }

  function requestReturnToTitle() {
    if (!["playing", "paused"].includes(game.state)) {
      showTitle();
      return;
    }
    const previousState = game.state;
    if (previousState === "playing") {
      game.state = "paused";
      audio.stopBgm();
    }
    const confirmed = window.confirm(`現在のプレイを終了してタイトルへ戻りますか？
現在のスコアは最高スコアへ反映されます。`);
    if (confirmed) {
      saveHighScore();
      showTitle();
    } else if (previousState === "playing") {
      game.state = "playing";
      game.frameTime = performance.now();
      audio.startBgm(game.stage);
    }
  }

  function togglePause() {
    if (game.state === "playing") {
      game.state = "paused";
      audio.stopBgm();
      showMessage("PAUSE", "ひと休み", "準備ができたら、また走り出そう。", "再開", () => {
        ui.message.classList.add("is-hidden");
        game.state = "playing";
        game.frameTime = performance.now();
        audio.startBgm(game.stage);
      });
    } else if (game.state === "paused") {
      ui.messageButton.click();
    }
  }

  function bindEvents() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      updateInstallButton();
    });
    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      updateInstallButton();
      toast("GO！むらっぴをホーム画面へ追加しました");
    });
    window.matchMedia?.("(display-mode: standalone)").addEventListener?.("change", updateInstallButton);
    window.addEventListener("online", () => toast("オンラインに戻りました"));
    window.addEventListener("offline", () => toast("オフラインでプレイできます"));
    window.addEventListener("resize", resizeCanvas, { passive: true });
    canvas.addEventListener("pointerdown", async (event) => {
      event.preventDefault();
      await audio.unlock();
      queueJump();
    }, { passive: false });
    window.addEventListener("keydown", (event) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        queueJump();
      } else if (event.code === "Escape") {
        togglePause();
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && game.state === "playing") togglePause();
    });

    ui.start.addEventListener("click", async () => {
      await audio.unlock();
      resetRun();
    });
    ui.titleButton.addEventListener("click", (e) => { e.stopPropagation(); requestReturnToTitle(); });
    ui.pause.addEventListener("click", (e) => { e.stopPropagation(); togglePause(); });
    ui.sound.addEventListener("click", (e) => { e.stopPropagation(); audio.toggle(); if (audio.enabled && game.state === "playing") audio.startBgm(game.stage); });
    ui.titleSound.addEventListener("click", async () => { audio.toggle(); if (audio.enabled) await audio.unlock(); });
    ui.installButton.addEventListener("click", showInstallGuide);
    ui.installActionButton.addEventListener("click", runInstallAction);
    ui.messageButton.addEventListener("click", () => {
      const callback = game.messageCallback;
      game.messageCallback = null;
      if (callback) callback();
    });
    ui.endingTitle.addEventListener("click", showTitle);
    ui.share.addEventListener("click", shareScore);
    ui.rankingButton.addEventListener("click", renderRanking);
    ui.editorButton.addEventListener("click", openEditor);
    ui.editorStageSelect.addEventListener("change", () => loadEditorStage(Number(ui.editorStageSelect.value)));
    ui.editorTitleInput.addEventListener("input", () => {
      syncEditorMetaToStage();
      refreshCurrentStageOptionLabel();
      refreshEditorJson();
    });
    ui.editorSpeedInput.addEventListener("change", refreshEditorJson);
    ui.editorColumnsInput.addEventListener("change", () => resizeEditorColumns(currentEditorStage(), ui.editorColumnsInput.value));
    ui.editorIncludeInput.addEventListener("change", () => {
      syncEditorMetaToStage();
      refreshCurrentStageOptionLabel();
      refreshEditorJson();
    });
    ui.newStage.addEventListener("click", newEditorStage);
    ui.deleteStage.addEventListener("click", deleteEditorStage);
    ui.saveDraftStage.addEventListener("click", saveCurrentStageAsDraft);
    ui.newPattern.addEventListener("click", beginNewPattern);
    ui.savePattern.addEventListener("click", savePatternDefinition);
    ui.deletePattern.addEventListener("click", deletePatternDefinition);
    ui.resetPatterns.addEventListener("click", resetPatternDefinitions);
    ui.patternImageInput.addEventListener("change", async () => {
      const file = ui.patternImageInput.files?.[0];
      if (!file) return;
      try {
        ui.patternImageName.textContent = "画像を処理中…";
        editor.patternPendingImage = await preparePatternImage(file);
        editor.patternPendingFileName = file.name;
        setPatternPreview(editor.patternPendingImage);
        ui.patternImageName.textContent = `${file.name}（端末保存用に最大512pxへ最適化）`;
      } catch (error) {
        editor.patternPendingImage = "";
        ui.patternImageInput.value = "";
        ui.patternImageName.textContent = error.message;
      }
    });
    ui.applyJson.addEventListener("click", applyEditorJson);
    ui.undoEditor.addEventListener("click", undoEditor);
    ui.fillGround.addEventListener("click", fillEditorGround);
    ui.clearMap.addEventListener("click", clearEditorMap);
    ui.testStage.addEventListener("click", testEditorStage);
    ui.saveStages.addEventListener("click", () => saveEditorStages(false));
    ui.exportStages.addEventListener("click", exportStages);
    ui.importStages.addEventListener("change", () => importStages(ui.importStages.files[0]));
    ui.resetStages.addEventListener("click", () => {
      safeLS.removeItem(CFG.storageKeys.customStages);
      editor.stages = normalizeStages(deepClone(DEFAULT_STAGES));
      game.stages = deepClone(editor.stages);
      editor.ready = false;
      populateEditorStageSelect();
      loadEditorStage(0);
      ui.editorStatus.style.color = "#176f60";
      ui.editorStatus.textContent = "初期ステージへ戻しました。保存するまでは端末に確定されません。";
    });

    ui.mapEditorCanvas.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      editor.painting = true;
      editor.lastCellKey = "";
      pushEditorHistory();
      ui.mapEditorCanvas.setPointerCapture?.(event.pointerId);
      const cell = editorCellFromPointer(event);
      paintEditorCell(cell.row, cell.col);
    }, { passive: false });
    ui.mapEditorCanvas.addEventListener("pointermove", (event) => {
      if (!editor.painting) return;
      event.preventDefault();
      const cell = editorCellFromPointer(event);
      paintEditorCell(cell.row, cell.col);
    }, { passive: false });
    const finishPainting = () => {
      if (!editor.painting) return;
      editor.painting = false;
      editor.lastCellKey = "";
      refreshEditorJson();
    };
    ui.mapEditorCanvas.addEventListener("pointerup", finishPainting);
    ui.mapEditorCanvas.addEventListener("pointercancel", finishPainting);
    window.addEventListener("pointerup", finishPainting);
    document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
    ui.modalBackdrop.addEventListener("pointerdown", (event) => {
      if (event.target === ui.modalBackdrop) closeModal();
    });
  }

  async function init() {
    resizeCanvas();
    bindEvents();
    updateSoundButtons();
    updateInstallButton();
    ui.start.disabled = true;
    ui.start.textContent = "読み込み中…";
    game.state = "loading";
    requestAnimationFrame(loop);
    await loadPatternDefinitions();
    game.stages = loadStages();
    await preloadAssets();
    game.state = "title";
    ui.start.disabled = false;
    ui.start.textContent = "プレイ開始";
    showTitle();

    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("service-worker.js").catch((error) => console.warn("SW registration failed", error));
    }
  }

  init();
})();