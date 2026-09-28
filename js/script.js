// ===== KONFIGURATION =====
const GAME_WIDTH = 960;
const GAME_HEIGHT = 1280;
const LANES = [240, 480, 720];
const PLAYER_Y = 1120;
const ITEMS_PER_LEVEL = 15;
const ITEMS_PER_LEVEL_MAX = 20;
const MAX_LEVEL = 10;
const LEVEL_PAUSE_MS = 2400;
const STORAGE_KEY = 'mitt-spel-highscores';

// ===== SVÅRIGHETSKURVA =====
const SPEED_MIN = 90;
const SPEED_MAX = 350;
const SPAWN_MIN = 550;
const SPAWN_MAX = 2000;

// ===== LJUDVOLYM =====
const VOLUME = {
    collect:    0.8,
    hit:        0.4,
    new_level:  0.7,
    highscore:  0.8,
    game_over:  0.8,
    music:      0.3
};

// ===== SPELTILLSTÅND =====
const gameState = {
    currentLane: 1,
    score: 0,
    lives: 3,
    level: 1,
    itemsThisLevel: 0,
    gameOver: false,
    paused: false,
    subject: null,
    levelTheme: null,
    currentLevelConfig: null,
    playerName: ''
};

let player;
let items;
let scoreText;
let livesText;
let levelText;
let themeText;
let spawnTimer;
let pauseButton;
let pauseMenuElements = [];
let allMenuElements = [];
let gameOverElements = [];
let nameInputElements = [];
let nameInputValue = '';
let nameInputText = null;
let music;

console.log('[BOOT] script.js laddas...');

// ===== PHASER-KONFIGURATION =====
const config = {
    type: Phaser.AUTO,
    backgroundColor: '#1a1a2e',
    parent: document.body,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },
    audio: {
        disableWebAudio: false
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

if (typeof Phaser === 'undefined') {
    console.error('[FEL] Phaser är inte laddat!');
    document.body.innerHTML = '<h1 style="color:red;">Phaser kunde inte laddas.</h1>';
} else {
    console.log('[BOOT] Phaser version:', Phaser.VERSION);
    new Phaser.Game(config);
}

// ===== PRELOAD =====
function preload() {
    console.log('[SCENE] preload() körs');

    this.load.audio('collect',    'sounds/collect.wav');
    this.load.audio('hit',        'sounds/hit.wav');
    this.load.audio('new_level',  'sounds/new_level.wav');
    this.load.audio('highscore',  'sounds/highscore.wav');
    this.load.audio('game_over',  'sounds/game_over.wav');
    this.load.audio('music',      'sounds/game_level_music.wav');

    this.load.on('complete', () => {
        console.log('[PRELOAD] Alla resurser laddade');
    });

    this.load.on('loaderror', (file) => {
        console.error('[PRELOAD] Kunde inte ladda:', file.key, file.src);
    });
}

// ===== LJUDHJÄLPARE =====
function playSound(scene, key) {
    if (!scene.sound || !scene.cache.audio.exists(key)) {
        console.warn('[SOUND] Saknas:', key);
        return;
    }
    try {
        const vol = VOLUME[key] !== undefined ? VOLUME[key] : 0.6;
        scene.sound.play(key, { volume: vol });
        console.log('[SOUND] Spelar:', key, '@', vol);
    } catch (err) {
        console.error('[SOUND] Fel vid uppspelning av', key, err);
    }
}

function startMusic(scene) {
    if (!scene.cache.audio.exists('music')) {
        console.warn('[SOUND] Musik saknas');
        return;
    }
    if (music && music.isPlaying) return;

    try {
        music = scene.sound.add('music', {
            volume: VOLUME.music,
            loop: true
        });
        music.play();
        console.log('[SOUND] Musik startad');
    } catch (err) {
        console.error('[SOUND] Kunde inte starta musik:', err);
    }
}

function stopMusic() {
    if (music && music.isPlaying) {
        music.stop();
        music = null;
        console.log('[SOUND] Musik stoppad');
    }
}

// ===== CREATE =====
function create() {
    console.log('[SCENE] create() körs');

    try {
        player = this.add.rectangle(LANES[gameState.currentLane], PLAYER_Y, 88, 88, 0x00ff88);
        player.setVisible(false);

        items = this.add.group();

        scoreText = this.add.text(32, 32, 'Poäng: 0', {
            fontSize: '44px', fill: '#ffffff'
        }).setVisible(false);
        livesText = this.add.text(32, 92, 'Liv: 3', {
            fontSize: '44px', fill: '#ff6688'
        }).setVisible(false);
        levelText = this.add.text(GAME_WIDTH - 32, 32, 'Nivå: 1', {
            fontSize: '44px', fill: '#88ccff'
        }).setOrigin(1, 0).setVisible(false);

        themeText = this.add.text(GAME_WIDTH / 2, 180, '', {
            fontSize: '36px', fill: '#ffff88'
        }).setOrigin(0.5, 0).setVisible(false);

        // Pausknapp
        pauseButton = this.add.container(GAME_WIDTH - 80, 112);
        const pauseBg = this.add.circle(0, 0, 44, 0x000000, 0.5);
        const bar1 = this.add.rectangle(-12, 0, 8, 40, 0xffffff);
        const bar2 = this.add.rectangle(12, 0, 8, 40, 0xffffff);
        pauseButton.add([pauseBg, bar1, bar2]);
        pauseButton.setSize(88, 88);
        pauseButton.setInteractive({ useHandCursor: true });
        pauseButton.setVisible(false);
        pauseButton.on('pointerdown', () => {
            if (gameState.gameOver) return;
            if (gameState.paused) resumeGame(this);
            else pauseGame(this);
        });

        // Helskärmsknapp
        const fullscreenButton = this.add.container(GAME_WIDTH - 80, 220);
        const fsBg = this.add.circle(0, 0, 44, 0x000000, 0.5);
        const fsIcon = this.add.text(0, 0, '⛶', {
            fontSize: '44px', fill: '#ffffff'
        }).setOrigin(0.5);
        fullscreenButton.add([fsBg, fsIcon]);
        fullscreenButton.setSize(88, 88);
        fullscreenButton.setInteractive({ useHandCursor: true });
        fullscreenButton.on('pointerdown', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        // Tangentbordsstyrning
        this.input.keyboard.on('keydown-LEFT', () => {
            if (gameState.gameOver || gameState.paused || !gameState.subject) return;
            gameState.currentLane = Math.max(0, gameState.currentLane - 1);
        });
        this.input.keyboard.on('keydown-RIGHT', () => {
            if (gameState.gameOver || gameState.paused || !gameState.subject) return;
            gameState.currentLane = Math.min(2, gameState.currentLane + 1);
        });
        this.input.keyboard.on('keydown-ESC', () => {
            if (gameState.gameOver || !gameState.subject) return;
            if (gameState.paused) resumeGame(this);
            else pauseGame(this);
        });
        this.input.keyboard.on('keydown-F', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        // ===== SWIPE-STYRNING =====
        let touchStartX = 0;
        let touchStartY = 0;
        const SWIPE_THRESHOLD = 50;
        const MAX_VERTICAL_DRIFT = 80;

        this.input.on('pointerdown', (pointer) => {
            touchStartX = pointer.x;
            touchStartY = pointer.y;
        });

        this.input.on('pointerup', (pointer) => {
            if (gameState.gameOver || gameState.paused || !gameState.subject) return;
            if (nameInputElements.length > 0) return;  // ignorera swipe när namnskärmen visas

            const dx = pointer.x - touchStartX;
            const dy = pointer.y - touchStartY;

            if (Math.abs(dx) < SWIPE_THRESHOLD) return;
            if (Math.abs(dy) > MAX_VERTICAL_DRIFT) return;

            if (dx < 0) {
                gameState.currentLane = Math.max(0, gameState.currentLane - 1);
            } else {
                gameState.currentLane = Math.min(2, gameState.currentLane + 1);
            }
        });

        showStartMenu(this);

        console.log('[SCENE] create() klar');
    } catch (err) {
        console.error('[FEL] create() kraschade:', err);
    }
}

// ===== HJÄLPFUNKTION: RENSA MENY =====
function clearElements(elements) {
    elements.forEach(el => { if (el && el.active) el.destroy(); });
    return [];
}

// ===== STARTMENY =====
function showStartMenu(scene) {
    allMenuElements = clearElements(allMenuElements);

    allMenuElements.push(
        scene.add.text(GAME_WIDTH / 2, 300, 'VÄLJ ÄMNE', {
            fontSize: '64px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5)
    );

    const subjects = [
        { key: 'matematik', label: 'Matematik', color: 0x00cc66 },
        { key: 'svenska',   label: 'Svenska',   color: 0x6688ff },
        { key: 'engelska',  label: 'Engelska',  color: 0xff8844 }
    ];

    subjects.forEach((subj, i) => {
        const y = 520 + i * 180;
        const btn = scene.add.rectangle(GAME_WIDTH / 2, y, 520, 120, subj.color)
            .setInteractive({ useHandCursor: true });

        const label = scene.add.text(GAME_WIDTH / 2, y, subj.label, {
            fontSize: '48px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(subj.color, 1.3));
        btn.on('pointerout',  () => btn.setFillStyle(subj.color, 1.0));
        btn.on('pointerdown', () => {
            if (scene.sound && scene.sound.locked) {
                scene.sound.unlock();
            }
            clearElements(allMenuElements);
            allMenuElements = [];
            startGame(scene, subj.key);
        });

        allMenuElements.push(btn, label);
    });

    allMenuElements.push(
        scene.add.text(GAME_WIDTH / 2, 1160, 'Välj ett ämne för att börja', {
            fontSize: '32px', fill: '#888888'
        }).setOrigin(0.5)
    );
}

// ===== STARTA SPELET =====
function startGame(scene, subject) {
    console.log('[GAME] Startar ämne:', subject);

    gameOverElements = clearElements(gameOverElements);
    nameInputElements = clearElements(nameInputElements);

    gameState.subject = subject;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.itemsThisLevel = 0;
    gameState.gameOver = false;
    gameState.paused = false;
    gameState.currentLane = 1;

    gameState._svenskaOrder = null;
    gameState._engelskaOrder = null;

    player.setVisible(true);
    player.x = LANES[1];
    scoreText.setVisible(true);
    livesText.setVisible(true);
    levelText.setVisible(true);
    themeText.setVisible(true);
    pauseButton.setVisible(true);

    startMusic(scene);

    updateHUD();
    startLevel(scene);
}

// ===== NIVÅKONFIGURATION PER ÄMNE =====
function getLevelConfig(subject, level) {
    if (subject === 'matematik') {
        return getMathConfig(level);
    }

    if (subject === 'svenska') {
        return getSwedishConfig(level);
    }

    if (subject === 'engelska') {
        return getEnglishConfig(level);
    }

    return {
        theme: 'Ej implementerat',
        generate: () => ({
            display: '?',
            isCorrect: false
        })
    };
}

// ===== MATEMATIK =====
function getMathConfig(level) {
    if (level === 1) {
        return {
            theme: 'Jämna tal',
            generate: () => {
                const value = Phaser.Math.Between(1, 100);
                return {
                    display: String(value),
                    isCorrect: value % 2 === 0
                };
            }
        };
    }
    if (level === 2) {
        return {
            theme: 'Udda tal',
            generate: () => {
                const value = Phaser.Math.Between(1, 100);
                return {
                    display: String(value),
                    isCorrect: value % 2 === 1
                };
            }
        };
    }
    const divisor = Phaser.Math.Between(3, 10);
    return {
        theme: 'Delbart med ' + divisor,
        generate: () => {
            const value = Phaser.Math.Between(1, 100);
            return {
                display: String(value),
                isCorrect: value % divisor === 0
            };
        }
    };
}

// ===== SVENSKA =====
function getSwedishConfig(level) {
    if (typeof SWEDISH_DATA === 'undefined') {
        console.error('[FEL] SWEDISH_DATA är inte laddad!');
        return {
            theme: 'Data saknas',
            generate: () => ({ display: '?', isCorrect: false })
        };
    }

    const keys = Object.keys(SWEDISH_DATA);

    if (!gameState._svenskaOrder) {
        gameState._svenskaOrder = Phaser.Utils.Array.Shuffle(keys.slice());
    }
    const key = gameState._svenskaOrder[(level - 1) % gameState._svenskaOrder.length];
    const category = SWEDISH_DATA[key];

    const wrongCategories = keys.filter(k => k !== key);

    return {
        theme: 'Ordklass: ' + category.theme,
        generate: () => {
            const useCorrect = Math.random() < 0.55;

            if (useCorrect) {
                const word = Phaser.Utils.Array.GetRandom(category.words);
                return { display: word, isCorrect: true };
            } else {
                const wrongKey = Phaser.Utils.Array.GetRandom(wrongCategories);
                const word = Phaser.Utils.Array.GetRandom(SWEDISH_DATA[wrongKey].words);
                return { display: word, isCorrect: false };
            }
        }
    };
}

// ===== ENGELSKA =====
function getEnglishConfig(level) {
    if (typeof ENGLISH_DATA === 'undefined') {
        console.error('[FEL] ENGLISH_DATA är inte laddad!');
        return {
            theme: 'Data saknas',
            generate: () => ({ display: '?', isCorrect: false })
        };
    }

    const keys = Object.keys(ENGLISH_DATA);

    if (!gameState._engelskaOrder) {
        gameState._engelskaOrder = Phaser.Utils.Array.Shuffle(keys.slice());
    }
    const key = gameState._engelskaOrder[(level - 1) % gameState._engelskaOrder.length];
    const category = ENGLISH_DATA[key];

    const wrongCategories = keys.filter(k => k !== key);

    return {
        theme: 'Category: ' + category.theme,
        generate: () => {
            const useCorrect = Math.random() < 0.55;

            if (useCorrect) {
                const word = Phaser.Utils.Array.GetRandom(category.words);
                return { display: word, isCorrect: true };
            } else {
                const wrongKey = Phaser.Utils.Array.GetRandom(wrongCategories);
                const word = Phaser.Utils.Array.GetRandom(ENGLISH_DATA[wrongKey].words);
                return { display: word, isCorrect: false };
            }
        }
    };
}

// ===== SVÅRIGHETSKURVA =====
function lerpByLevel(level, startValue, endValue) {
    const cappedLevel = Math.min(level, MAX_LEVEL);
    const t = (cappedLevel - 1) / (MAX_LEVEL - 1);
    return startValue + (endValue - startValue) * t;
}

function getSpawnDelay(level) {
    return Math.round(lerpByLevel(level, SPAWN_MAX, SPAWN_MIN));
}

function getFallSpeed(level) {
    return Math.round(lerpByLevel(level, SPEED_MIN, SPEED_MAX));
}

function getItemsPerLevel(level) {
    return level >= MAX_LEVEL ? ITEMS_PER_LEVEL_MAX : ITEMS_PER_LEVEL;
}

// ===== STARTA EN NIVÅ =====
function startLevel(scene) {
    gameState.itemsThisLevel = 0;
    gameState.currentLevelConfig = getLevelConfig(gameState.subject, gameState.level);

    themeText.setText('Tema: ' + gameState.currentLevelConfig.theme);
    updateHUD();

    startSpawnTimer(scene);
}

// ===== SPAWN-TIMER =====
function startSpawnTimer(scene) {
    if (spawnTimer) spawnTimer.remove();

    const delay = getSpawnDelay(gameState.level);
    console.log('[SPAWN] Timer, delay =', delay, 'ms (nivå', gameState.level + ')');

    spawnTimer = scene.time.addEvent({
        delay: delay,
        callback: () => spawnItem(scene),
        loop: true
    });
}

// ===== SKAPA ETT FALLANDE FÖREMÅL =====
function spawnItem(scene) {
    if (gameState.gameOver || gameState.paused) return;
    if (!gameState.currentLevelConfig) return;

    try {
        const itemsPerLevel = getItemsPerLevel(gameState.level);

        if (gameState.itemsThisLevel >= itemsPerLevel) {
            nextLevel(scene);
            return;
        }

        const cfg = gameState.currentLevelConfig.generate();
        const laneX = LANES[Phaser.Math.Between(0, 2)];

        const label = scene.add.text(0, 0, cfg.display, {
            fontSize: '40px',
            fill: '#ffffff',
            fontStyle: 'bold',
            padding: { x: 24, y: 12 }
        }).setOrigin(0.5);

        const padding = 16;
        const boxWidth = Math.max(88, label.width + padding * 2);
        const boxHeight = 88;

        const gfx = scene.add.graphics();
        gfx.fillStyle(0x333333, 1);
        gfx.lineStyle(6, 0xffffff, 1);
        gfx.fillRoundedRect(
            -boxWidth / 2,
            -boxHeight / 2,
            boxWidth,
            boxHeight,
            boxHeight / 2
        );
        gfx.strokeRoundedRect(
            -boxWidth / 2,
            -boxHeight / 2,
            boxWidth,
            boxHeight,
            boxHeight / 2
        );

        const item = scene.add.container(laneX, -60, [gfx, label]);

        item.setData('isCorrect', cfg.isCorrect);
        item.setData('speed', getFallSpeed(gameState.level));
        item.setData('width', boxWidth);
        item.setData('height', boxHeight);

        items.add(item);
        gameState.itemsThisLevel += 1;

        console.log('[SPAWN]', cfg.display, 'rätt?', cfg.isCorrect,
                    'vid x=', laneX, 'y=', item.y,
                    '| bredd=', boxWidth,
                    '| hastighet=', getFallSpeed(gameState.level),
                    '(', gameState.itemsThisLevel, '/', itemsPerLevel, ')');
    } catch (err) {
        console.error('[FEL] spawnItem() kraschade:', err);
    }
}

// ===== KOLLISION =====
function checkCollisions(scene) {
    if (gameState.gameOver || gameState.paused) return;

    items.getChildren().forEach((item) => {
        const itemWidth = item.getData('width') || 88;
        const itemHeight = item.getData('height') || 88;

        const dx = Math.abs(item.x - player.x);
        const dy = Math.abs(item.y - player.y);

        const overlapX = dx < (itemWidth / 2 + 44);
        const overlapY = dy < (itemHeight / 2 + 44);

        if (overlapX && overlapY) {
            const isCorrect = item.getData('isCorrect');

            console.log('[COLLECT]', isCorrect ? 'RÄTT' : 'FEL',
                        '| Poäng:', gameState.score, '| Liv:', gameState.lives);

            item.destroy();

            if (isCorrect) {
                gameState.score += 1;
                playSound(scene, 'collect');
            } else {
                gameState.lives -= 1;
                if (gameState.lives <= 0) {
                    updateHUD();
                    endGame(scene);
                    return;
                } else {
                    playSound(scene, 'hit');
                }
            }

            updateHUD();
        }
    });
}

// ===== HUD =====
function updateHUD() {
    scoreText.setText('Poäng: ' + gameState.score);
    livesText.setText('Liv: ' + gameState.lives);
    levelText.setText('Nivå: ' + gameState.level);
}

// ===== GÅ TILL NÄSTA NIVÅ =====
function nextLevel(scene) {
    gameState.level += 1;

    if (spawnTimer) spawnTimer.remove();

    themeText.setText('NIVÅ ' + gameState.level + '!');
    updateHUD();

    playSound(scene, 'new_level');

    scene.time.delayedCall(LEVEL_PAUSE_MS, () => {
        if (gameState.gameOver || gameState.paused) return;
        startLevel(scene);
    });
}

// ===== PAUSA SPELET =====
function pauseGame(scene) {
    if (gameState.paused || gameState.gameOver) return;
    gameState.paused = true;

    if (spawnTimer) spawnTimer.paused = true;
    if (music && music.isPlaying) music.pause();

    console.log('[PAUSE] Spelet pausat');

    const overlay = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
                                        GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);

    const title = scene.add.text(GAME_WIDTH / 2, 320, 'PAUSAT', {
        fontSize: '72px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    pauseMenuElements = [overlay, title];

    const btnContinue = scene.add.rectangle(GAME_WIDTH / 2, 560, 560, 110, 0x00cc66)
        .setInteractive({ useHandCursor: true });
    const lblContinue = scene.add.text(GAME_WIDTH / 2, 560, 'Fortsätt spelet', {
        fontSize: '40px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    btnContinue.on('pointerover', () => btnContinue.setFillStyle(0x00cc66, 1.3));
    btnContinue.on('pointerout',  () => btnContinue.setFillStyle(0x00cc66, 1.0));
    btnContinue.on('pointerdown', () => resumeGame(scene));
    pauseMenuElements.push(btnContinue, lblContinue);

    const btnChange = scene.add.rectangle(GAME_WIDTH / 2, 720, 560, 110, 0x6688ff)
        .setInteractive({ useHandCursor: true });
    const lblChange = scene.add.text(GAME_WIDTH / 2, 720, 'Byt ämne', {
        fontSize: '40px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    btnChange.on('pointerover', () => btnChange.setFillStyle(0x6688ff, 1.3));
    btnChange.on('pointerout',  () => btnChange.setFillStyle(0x6688ff, 1.0));
    btnChange.on('pointerdown', () => changeSubject(scene));
    pauseMenuElements.push(btnChange, lblChange);

    const btnRecords = scene.add.rectangle(GAME_WIDTH / 2, 880, 560, 110, 0xffaa33)
        .setInteractive({ useHandCursor: true });
    const lblRecords = scene.add.text(GAME_WIDTH / 2, 880, 'Se mina rekord', {
        fontSize: '40px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    btnRecords.on('pointerover', () => btnRecords.setFillStyle(0xffaa33, 1.3));
    btnRecords.on('pointerout',  () => btnRecords.setFillStyle(0xffaa33, 1.0));
    btnRecords.on('pointerdown', () => showRecords(scene));
    pauseMenuElements.push(btnRecords, lblRecords);

    const hint = scene.add.text(GAME_WIDTH / 2, 1100, 'Tryck ESC för att fortsätta', {
        fontSize: '28px', fill: '#888888'
    }).setOrigin(0.5);
    pauseMenuElements.push(hint);
}

// ===== FORTSÄTT SPELET =====
function resumeGame(scene) {
    if (!gameState.paused) return;

    pauseMenuElements = clearElements(pauseMenuElements);
    gameState.paused = false;
    if (spawnTimer) spawnTimer.paused = false;
    if (music && !music.isPlaying) music.resume();

    console.log('[PAUSE] Spelet fortsätter');
}

// ===== BYT ÄMNE =====
function changeSubject(scene) {
    pauseMenuElements = clearElements(pauseMenuElements);
    gameOverElements = clearElements(gameOverElements);
    nameInputElements = clearElements(nameInputElements);

    if (spawnTimer) spawnTimer.remove();

    items.getChildren().forEach((item) => {
        item.destroy();
    });

    player.setVisible(false);
    scoreText.setVisible(false);
    livesText.setVisible(false);
    levelText.setVisible(false);
    themeText.setVisible(false);
    pauseButton.setVisible(false);

    stopMusic();

    gameState.paused = false;
    gameState.subject = null;
    gameState.gameOver = false;

    showStartMenu(scene);
}

// ===== SE MINA REKORD =====
function showRecords(scene) {
    pauseMenuElements = clearElements(pauseMenuElements);

    const overlay = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
                                        GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);

    const title = scene.add.text(GAME_WIDTH / 2, 280, 'MINA REKORD', {
        fontSize: '64px', fill: '#ffaa33', fontStyle: 'bold'
    }).setOrigin(0.5);

    pauseMenuElements = [overlay, title];

    const records = loadRecords();

    if (records.length === 0) {
        const empty = scene.add.text(GAME_WIDTH / 2, 600, 'Inga rekord ännu', {
            fontSize: '40px', fill: '#888888'
        }).setOrigin(0.5);
        pauseMenuElements.push(empty);
    } else {
        records.slice(0, 3).forEach((rec, i) => {
            const y = 460 + i * 140;
            const medal = ['🥇', '🥈', '🥉'][i];
            const name = rec.name || 'Anonym';
            const line = scene.add.text(GAME_WIDTH / 2, y,
                `${medal}  ${name} – ${rec.score} p (${rec.subject})`, {
                fontSize: '36px', fill: '#ffffff'
            }).setOrigin(0.5);
            pauseMenuElements.push(line);
        });
    }

    const backBtn = scene.add.rectangle(GAME_WIDTH / 2, 1040, 480, 110, 0x00cc66)
        .setInteractive({ useHandCursor: true });
    const backLbl = scene.add.text(GAME_WIDTH / 2, 1040, 'Tillbaka', {
        fontSize: '40px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    backBtn.on('pointerover', () => backBtn.setFillStyle(0x00cc66, 1.3));
    backBtn.on('pointerout',  () => backBtn.setFillStyle(0x00cc66, 1.0));
    backBtn.on('pointerdown', () => {
        pauseMenuElements = clearElements(pauseMenuElements);
        pauseGame(scene);
    });
    pauseMenuElements.push(backBtn, backLbl);
}

// ===== REKORDHANTERING =====
function loadRecords() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch (err) {
        console.error('[FEL] Kunde inte läsa rekord:', err);
        return [];
    }
}

function isHighscore(score) {
    if (score <= 0) return false;
    const records = loadRecords();
    if (records.length < 3) return true;
    return score > records[records.length - 1].score;
}

function saveRecord(score, subject, name) {
    if (score <= 0) return;
    try {
        const records = loadRecords();
        records.push({
            score: score,
            subject: subject,
            name: name || 'Anonym',
            date: new Date().toISOString()
        });
        records.sort((a, b) => b.score - a.score);
        const top3 = records.slice(0, 3);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(top3));
        console.log('[RECORD] Sparat:', score, subject, name, '| Topp 3:', top3);
    } catch (err) {
        console.error('[FEL] Kunde inte spara rekord:', err);
    }
}

// ===== NAMNINMATNING =====
function showNameInput(scene, score, subject, onComplete) {
    nameInputValue = '';
    nameInputElements = clearElements(nameInputElements);

    const overlay = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
                                        GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.9);

    const title = scene.add.text(GAME_WIDTH / 2, 320, '🏆 NYTT REKORD!', {
        fontSize: '64px', fill: '#ffaa33', fontStyle: 'bold'
    }).setOrigin(0.5);

    const scoreLine = scene.add.text(GAME_WIDTH / 2, 400,
        score + ' poäng – ' + subject, {
        fontSize: '36px', fill: '#ffffff'
    }).setOrigin(0.5);

    const prompt = scene.add.text(GAME_WIDTH / 2, 540, 'Skriv ditt namn:', {
        fontSize: '36px', fill: '#ffffff'
    }).setOrigin(0.5);

    // Inmatningsruta
    const inputBox = scene.add.rectangle(GAME_WIDTH / 2, 660, 600, 100, 0x333333);
    inputBox.setStrokeStyle(4, 0xffffff);

    nameInputText = scene.add.text(GAME_WIDTH / 2, 660, '_', {
        fontSize: '48px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    nameInputElements = [overlay, title, scoreLine, prompt, inputBox, nameInputText];

    // Knapp: Spara
    const saveBtn = scene.add.rectangle(GAME_WIDTH / 2, 850, 500, 110, 0x00cc66)
        .setInteractive({ useHandCursor: true });
    const saveLbl = scene.add.text(GAME_WIDTH / 2, 850, 'Spara', {
        fontSize: '44px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    saveBtn.on('pointerover', () => saveBtn.setFillStyle(0x00cc66, 1.3));
    saveBtn.on('pointerout',  () => saveBtn.setFillStyle(0x00cc66, 1.0));
    saveBtn.on('pointerdown', () => {
        const finalName = nameInputValue.trim() || 'Anonym';
        cleanupNameInput(scene);
        onComplete(finalName);
    });
    nameInputElements.push(saveBtn, saveLbl);

    // Knapp: Hoppa över
    const skipBtn = scene.add.rectangle(GAME_WIDTH / 2, 1000, 500, 90, 0x666666)
        .setInteractive({ useHandCursor: true });
    const skipLbl = scene.add.text(GAME_WIDTH / 2, 1000, 'Hoppa över', {
        fontSize: '36px', fill: '#ffffff'
    }).setOrigin(0.5);
    skipBtn.on('pointerover', () => skipBtn.setFillStyle(0x666666, 1.3));
    skipBtn.on('pointerout',  () => skipBtn.setFillStyle(0x666666, 1.0));
    skipBtn.on('pointerdown', () => {
        cleanupNameInput(scene);
        onComplete('Anonym');
    });
    nameInputElements.push(skipBtn, skipLbl);

    // Tangentbordsinmatning
    scene.input.keyboard.on('keydown', (event) => {
        if (nameInputElements.length === 0) return;

        if (event.key === 'Enter') {
            const finalName = nameInputValue.trim() || 'Anonym';
            cleanupNameInput(scene);
            onComplete(finalName);
            return;
        }

        if (event.key === 'Backspace') {
            nameInputValue = nameInputValue.slice(0, -1);
        } else if (event.key.length === 1 && nameInputValue.length < 12) {
            // Tillåt bokstäver, siffror, mellanslag och vanliga tecken
            if (/^[a-zA-Z0-9åäöÅÄÖéèüÜ \-\_\.]$/.test(event.key)) {
                nameInputValue += event.key;
            }
        }

        nameInputText.setText(nameInputValue || '_');
    });
}

function cleanupNameInput(scene) {
    nameInputElements = clearElements(nameInputElements);
    nameInputText = null;
    nameInputValue = '';
    // Ta bort alla keydown-lyssnare för att undvika dubbelregistrering
    scene.input.keyboard.removeAllListeners('keydown');
    // Återställ grundläggande tangentbordsstyrning
    scene.input.keyboard.on('keydown-LEFT', () => {
        if (gameState.gameOver || gameState.paused || !gameState.subject) return;
        gameState.currentLane = Math.max(0, gameState.currentLane - 1);
    });
    scene.input.keyboard.on('keydown-RIGHT', () => {
        if (gameState.gameOver || gameState.paused || !gameState.subject) return;
        gameState.currentLane = Math.min(2, gameState.currentLane + 1);
    });
    scene.input.keyboard.on('keydown-ESC', () => {
        if (gameState.gameOver || !gameState.subject) return;
        if (gameState.paused) resumeGame(scene);
        else pauseGame(scene);
    });
    scene.input.keyboard.on('keydown-F', () => {
        if (scene.scale.isFullscreen) {
            scene.scale.stopFullscreen();
        } else {
            scene.scale.startFullscreen();
        }
    });
}

// ===== GAME OVER =====
function endGame(scene) {
    gameState.gameOver = true;
    if (spawnTimer) spawnTimer.remove();

    const wasHighscore = isHighscore(gameState.score);

    items.getChildren().forEach((item) => {
        item.destroy();
    });

    pauseButton.setVisible(false);

    stopMusic();
    playSound(scene, 'game_over');

    if (wasHighscore) {
        scene.time.delayedCall(1800, () => {
            playSound(scene, 'highscore');
        });

        // Visa namnskärmen först, sedan Game Over
        scene.time.delayedCall(2200, () => {
            showNameInput(scene, gameState.score, gameState.subject, (finalName) => {
                saveRecord(gameState.score, gameState.subject, finalName);
                gameState.playerName = finalName;
                showGameOverScreen(scene, true);
            });
        });
    } else {
        // Ingen highscore - visa Game Over direkt
        saveRecord(gameState.score, gameState.subject, '');
        showGameOverScreen(scene, false);
    }
}

// ===== GAME OVER-SKÄRM =====
function showGameOverScreen(scene, wasHighscore) {
    const overlay = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
                                        GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);

    const title = scene.add.text(GAME_WIDTH / 2, 240, 'GAME OVER', {
        fontSize: '96px', fill: '#ff4444', fontStyle: 'bold'
    }).setOrigin(0.5);

    const scoreLine = scene.add.text(GAME_WIDTH / 2, 350, 'Slutpoäng: ' + gameState.score, {
        fontSize: '56px', fill: '#ffffff'
    }).setOrigin(0.5);

    gameOverElements = [overlay, title, scoreLine];

    if (wasHighscore && gameState.playerName) {
        const recordMsg = scene.add.text(GAME_WIDTH / 2, 420,
            '🏆 ' + gameState.playerName + ' – NYTT REKORD!', {
            fontSize: '36px', fill: '#ffaa33', fontStyle: 'bold'
        }).setOrigin(0.5);
        gameOverElements.push(recordMsg);
    }

    const records = loadRecords();
    if (records.length > 0) {
        const topLabel = scene.add.text(GAME_WIDTH / 2, 500, 'Topp 3:', {
            fontSize: '36px', fill: '#ffaa33', fontStyle: 'bold'
        }).setOrigin(0.5);
        gameOverElements.push(topLabel);

        records.slice(0, 3).forEach((rec, i) => {
            const name = rec.name || 'Anonym';
            const line = scene.add.text(GAME_WIDTH / 2, 560 + i * 52,
                `${i + 1}. ${name} – ${rec.score} p (${rec.subject})`, {
                fontSize: '30px', fill: '#ffffff'
            }).setOrigin(0.5);
            gameOverElements.push(line);
        });
    }

    const btnSame = scene.add.rectangle(GAME_WIDTH / 2, 840, 600, 110, 0x00cc66)
        .setInteractive({ useHandCursor: true });
    const lblSame = scene.add.text(GAME_WIDTH / 2, 840, 'Spela igen – samma ämne', {
        fontSize: '36px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    btnSame.on('pointerover', () => btnSame.setFillStyle(0x00cc66, 1.3));
    btnSame.on('pointerout',  () => btnSame.setFillStyle(0x00cc66, 1.0));
    btnSame.on('pointerdown', () => {
        const prevSubject = gameState.subject;
        gameOverElements = clearElements(gameOverElements);
        startGame(scene, prevSubject);
    });
    gameOverElements.push(btnSame, lblSame);

    const btnChange = scene.add.rectangle(GAME_WIDTH / 2, 1000, 600, 110, 0x6688ff)
        .setInteractive({ useHandCursor: true });
    const lblChange = scene.add.text(GAME_WIDTH / 2, 1000, 'Spela igen – byt ämne', {
        fontSize: '36px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    btnChange.on('pointerover', () => btnChange.setFillStyle(0x6688ff, 1.3));
    btnChange.on('pointerout',  () => btnChange.setFillStyle(0x6688ff, 1.0));
    btnChange.on('pointerdown', () => changeSubject(scene));
    gameOverElements.push(btnChange, lblChange);
}

// ===== UPDATE =====
function update() {
    if (gameState.gameOver || gameState.paused || !gameState.subject) return;

    if (player) {
        player.x = Phaser.Math.Linear(player.x, LANES[gameState.currentLane], 0.25);
    }

    if (items) {
        items.getChildren().forEach((item) => {
            const speed = item.getData('speed') || 200;
            item.y += speed * (2 / 60);

            if (item.y > GAME_HEIGHT + 80) {
                item.destroy();
            }
        });

        checkCollisions(this);
    }
}