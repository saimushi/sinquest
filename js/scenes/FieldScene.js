// FieldScene - フィールドマップとキャラクター移動（MapLoader対応版）
class FieldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FieldScene' });
        this.player = null;
        this.cursors = null;
        this.isMoving = false;
        this.moveSpeed = 150;
        this.playerDirection = 'down';
        this.npcs = [];
        this.messageWindow = null;
        this.interactKey = null;
        this.actionPressed = false;
        this.menuKey = null;
        this.menuPressed = false;
        this.upPressed = false;
        this.downPressed = false;
        this.playerData = null;
        this.menuWindow = null;
        this.statusWindow = null;
        this.inputLocked = false; // マップ切り替わり時の入力ロック

        // エンカウントシステム
        this.stepCount = 0;
        this.nextEncounter = this.getRandomEncounterSteps();

        // マップシステム
        this.mapLoader = new MapLoader();
        this.currentMapData = null;
        this.tiles = [];
        this.tileSprites = [];
    }

    getRandomEncounterSteps() {
        const min = GameConfig.encounter.minSteps;
        const max = GameConfig.encounter.maxSteps;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    init(data) {
        // バトルから戻ってきた時のデータを保存
        this.returnData = data || null;
    }

    async create() {
        console.log('FieldScene: フィールド作成開始');

        // 歩行アニメーションを作成
        this.createAnimations();

        // プレイヤーデータを初期化または復元
        if (this.returnData && this.returnData.playerData) {
            this.playerData = this.returnData.playerData;
        } else {
            this.playerData = new PlayerData();
        }

        // メッセージウィンドウを作成
        this.messageWindow = new MessageWindow(this);

        // メニューウィンドウを作成
        this.menuWindow = new MenuWindow(this, this.playerData);
        this.statusWindow = new StatusWindow(this, this.playerData);

        // キーボード入力
        this.cursors = this.input.keyboard.createCursorKeys();
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // デバッグ情報表示
        this.debugText = this.add.text(10, 10, '', {
            fontSize: '10px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });
        this.debugText.setScrollFactor(0);

        // マップを読み込み（バトルから戻った場合は指定位置から、そうでなければ初期マップ）
        if (this.returnData && this.returnData.returnMap) {
            await this.loadAndRenderMap(
                this.returnData.returnMap,
                this.returnData.returnX,
                this.returnData.returnY
            );
        } else {
            await this.loadAndRenderMap('field');
        }
    }

    async loadAndRenderMap(mapId, spawnX = null, spawnY = null) {
        console.log(`マップ '${mapId}' を読み込み中...`);

        try {
            // マップデータを読み込み
            this.currentMapData = await this.mapLoader.loadMap(mapId);

            // 既存のタイルとNPCをクリア
            this.clearMap();

            // マップを描画
            this.renderMap();

            // プレイヤーを配置
            const tileSize = this.currentMapData.tileSize;
            const px = spawnX !== null ? spawnX : this.currentMapData.spawn.x;
            const py = spawnY !== null ? spawnY : this.currentMapData.spawn.y;

            if (this.player) {
                // 既存のプレイヤーを移動
                this.player.setPosition(px * tileSize, py * tileSize);
                this.player.gridX = px;
                this.player.gridY = py;
            } else {
                // プレイヤーを新規作成
                this.createPlayer(px, py);
            }

            // NPCを配置
            this.createNPCs();

            // カメラ設定
            const mapWidth = this.currentMapData.width * tileSize;
            const mapHeight = this.currentMapData.height * tileSize;
            this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
            // roundPixels=false, lerp=1で滑らかな追従
            this.cameras.main.startFollow(this.player, false, 1, 1);

            // マップ切り替わり直後の入力を300msロック
            this.inputLocked = true;
            this.time.delayedCall(300, () => {
                this.inputLocked = false;
            });

            console.log(`マップ '${this.currentMapData.name}' の読み込み完了`);
        } catch (error) {
            console.error('マップ読み込みエラー:', error);
            this.messageWindow.show('マップの読み込みに失敗しました。');
        }
    }

    clearMap() {
        // タイルスプライトを削除
        this.tileSprites.forEach(row => {
            row.forEach(tile => {
                if (tile) tile.destroy();
            });
        });
        this.tileSprites = [];

        // NPCを削除
        this.npcs.forEach(npc => {
            if (npc.sprite) npc.sprite.destroy();
        });
        this.npcs = [];
    }

    renderMap() {
        const mapData = this.currentMapData;
        const tileSize = mapData.tileSize;

        for (let y = 0; y < mapData.height; y++) {
            this.tileSprites[y] = [];
            for (let x = 0; x < mapData.width; x++) {
                const tileId = mapData.tiles[y][x];
                const tileKey = this.mapLoader.getTileKey(tileId);

                const tile = this.add.image(x * tileSize, y * tileSize, tileKey);
                tile.setOrigin(0, 0);
                tile.setDisplaySize(tileSize, tileSize);
                this.tileSprites[y][x] = tile;
            }
        }
    }

    createNPCs() {
        const tileSize = this.currentMapData.tileSize;
        const npcsData = this.currentMapData.npcs || [];

        npcsData.forEach(npcData => {
            const npc = {
                id: npcData.id,
                sprite: this.add.sprite(npcData.x * tileSize, npcData.y * tileSize, npcData.sprite),
                gridX: npcData.x,
                gridY: npcData.y,
                message: npcData.message,
                walkable: npcData.walkable !== undefined ? npcData.walkable : true // デフォルトはすり抜け可能
            };
            npc.sprite.setOrigin(0, 0);
            npc.sprite.setDisplaySize(tileSize, tileSize);
            this.npcs.push(npc);
        });
    }

    createAnimations() {
        // アニメーションが既に存在する場合はスキップ
        if (!this.anims.exists('walk_down')) {
            // 下方向の歩行アニメーション
            this.anims.create({
                key: 'walk_down',
                frames: [
                    { key: 'player_1' },
                    { key: 'player_2' },
                    { key: 'player_3' },
                    { key: 'player_2' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('walk_left')) {
            // 左方向の歩行アニメーション
            this.anims.create({
                key: 'walk_left',
                frames: [
                    { key: 'player_4' },
                    { key: 'player_5' },
                    { key: 'player_6' },
                    { key: 'player_5' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('walk_right')) {
            // 右方向の歩行アニメーション
            this.anims.create({
                key: 'walk_right',
                frames: [
                    { key: 'player_7' },
                    { key: 'player_8' },
                    { key: 'player_9' },
                    { key: 'player_8' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('walk_up')) {
            // 上方向の歩行アニメーション
            this.anims.create({
                key: 'walk_up',
                frames: [
                    { key: 'player_10' },
                    { key: 'player_11' },
                    { key: 'player_12' },
                    { key: 'player_11' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        // アイドル（立ち）状態のフレーム
        this.idleFrames = {
            down: 'player_1',
            left: 'player_4',
            right: 'player_7',
            up: 'player_10'
        };
    }

    createPlayer(gridX, gridY) {
        const tileSize = this.currentMapData.tileSize;
        const startX = gridX * tileSize;
        const startY = gridY * tileSize;

        this.player = this.add.sprite(startX, startY, 'player_1');
        this.player.setOrigin(0, 0);
        this.player.setDisplaySize(tileSize, tileSize);
        this.player.gridX = gridX;
        this.player.gridY = gridY;
        this.player.setDepth(10); // プレイヤーを前面に
    }

    update() {
        if (!this.player || !this.currentMapData) return;

        // マップ切り替わり直後は入力を無視
        if (this.inputLocked) return;

        // ステータスウィンドウが表示されている場合
        if (this.statusWindow && this.statusWindow.isVisible()) {
            if (Phaser.Input.Keyboard.JustDown(this.menuKey) ||
                (window.VirtualInput.menu && !this.menuPressed)) {
                this.statusWindow.hide();
                this.menuWindow.show();
                this.menuPressed = true;
            }
            if (!window.VirtualInput.menu) {
                this.menuPressed = false;
            }
            return;
        }

        // メニューウィンドウが表示されている場合
        if (this.menuWindow && this.menuWindow.isVisible()) {
            if (Phaser.Input.Keyboard.JustDown(this.menuKey) ||
                (window.VirtualInput.menu && !this.menuPressed)) {
                this.menuWindow.hide();
                this.menuPressed = true;
            }
            if (!window.VirtualInput.menu) {
                this.menuPressed = false;
            }

            // 十字キーでメニュー移動（スマホ対応）
            if (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                (window.VirtualInput.up && !this.upPressed)) {
                this.menuWindow.moveUp();
                this.upPressed = true;
            }
            if (!window.VirtualInput.up) {
                this.upPressed = false;
            }

            if (Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
                (window.VirtualInput.down && !this.downPressed)) {
                this.menuWindow.moveDown();
                this.downPressed = true;
            }
            if (!window.VirtualInput.down) {
                this.downPressed = false;
            }

            if (Phaser.Input.Keyboard.JustDown(this.interactKey) ||
                (window.VirtualInput.action && !this.actionPressed)) {
                const action = this.menuWindow.select();
                this.handleMenuAction(action);
                this.actionPressed = true;
            }
            if (!window.VirtualInput.action) {
                this.actionPressed = false;
            }
            return;
        }

        // メッセージウィンドウが表示されている場合
        if (this.messageWindow && this.messageWindow.isVisible()) {
            if (Phaser.Input.Keyboard.JustDown(this.interactKey) ||
                (window.VirtualInput.action && !this.actionPressed)) {
                this.messageWindow.skipTyping();
                this.actionPressed = true;
            }
            if (!window.VirtualInput.action) {
                this.actionPressed = false;
            }
            return;
        }

        // 移動中は他の操作不可
        if (this.isMoving) return;

        // ESCキーまたはXボタンでメニューを開く
        if (Phaser.Input.Keyboard.JustDown(this.menuKey) ||
            (window.VirtualInput.menu && !this.menuPressed)) {
            this.menuWindow.show();
            this.menuPressed = true;
        }
        if (!window.VirtualInput.menu) {
            this.menuPressed = false;
        }

        // SPACEキーまたはAボタンでNPCと会話
        if (Phaser.Input.Keyboard.JustDown(this.interactKey) ||
            (window.VirtualInput.action && !this.actionPressed)) {
            this.tryInteract();
            this.actionPressed = true;
        }
        if (!window.VirtualInput.action) {
            this.actionPressed = false;
        }

        // 方向キー入力をチェック
        let moveX = 0;
        let moveY = 0;

        if (this.cursors.left.isDown || window.VirtualInput.left) {
            moveX = -1;
        } else if (this.cursors.right.isDown || window.VirtualInput.right) {
            moveX = 1;
        } else if (this.cursors.up.isDown || window.VirtualInput.up) {
            moveY = -1;
        } else if (this.cursors.down.isDown || window.VirtualInput.down) {
            moveY = 1;
        }

        // 移動があれば実行
        if (moveX !== 0 || moveY !== 0) {
            this.movePlayer(moveX, moveY);
        }

        // デバッグ情報更新
        const controlMethod = (window.VirtualInput.up || window.VirtualInput.down ||
                               window.VirtualInput.left || window.VirtualInput.right)
                               ? 'Touch' : 'Keys';

        this.debugText.setText([
            `Map: ${this.currentMapData.name}`,
            `Pos: (${this.player.gridX}, ${this.player.gridY})`,
            `Dir: ${this.playerDirection}`,
            `Control: ${controlMethod}`
        ]);
    }

    handleMenuAction(action) {
        switch(action) {
            case 'status':
                this.menuWindow.hide();
                this.statusWindow.show();
                break;
            case 'item':
                this.messageWindow.show('アイテムはまだ実装されていません。');
                this.menuWindow.hide();
                break;
            case 'equip':
                this.messageWindow.show('装備はまだ実装されていません。');
                this.menuWindow.hide();
                break;
            case 'save':
                this.messageWindow.show('セーブ機能はまだ実装されていません。');
                this.menuWindow.hide();
                break;
            case 'close':
                this.menuWindow.hide();
                break;
        }
    }

    tryInteract() {
        let targetX = this.player.gridX;
        let targetY = this.player.gridY;

        switch(this.playerDirection) {
            case 'up': targetY -= 1; break;
            case 'down': targetY += 1; break;
            case 'left': targetX -= 1; break;
            case 'right': targetX += 1; break;
        }

        // NPCがいるかチェック
        const npc = this.npcs.find(n => n.gridX === targetX && n.gridY === targetY);
        if (npc) {
            this.messageWindow.show(npc.message);
        }
    }

    async movePlayer(dx, dy) {
        const newGridX = this.player.gridX + dx;
        const newGridY = this.player.gridY + dy;

        // 移動方向を判定
        let direction = 'down';
        let animKey = 'walk_down';

        if (dy < 0) {
            direction = 'up';
            animKey = 'walk_up';
        } else if (dy > 0) {
            direction = 'down';
            animKey = 'walk_down';
        } else if (dx < 0) {
            direction = 'left';
            animKey = 'walk_left';
        } else if (dx > 0) {
            direction = 'right';
            animKey = 'walk_right';
        }

        // マップ範囲チェック
        if (newGridX < 0 || newGridX >= this.currentMapData.width ||
            newGridY < 0 || newGridY >= this.currentMapData.height) {
            // 移動できないが向きは変える
            this.playerDirection = direction;
            this.player.setTexture(this.idleFrames[direction]);
            return;
        }

        const tileId = this.currentMapData.tiles[newGridY][newGridX];

        // タイルが移動可能かチェック
        if (!this.mapLoader.canWalkOn(tileId)) {
            // 移動できないが向きは変える
            this.playerDirection = direction;
            this.player.setTexture(this.idleFrames[direction]);
            return;
        }

        // NPCの衝突判定（walkable: false のNPCは通れない）
        const blockingNPC = this.npcs.find(npc =>
            npc.gridX === newGridX &&
            npc.gridY === newGridY &&
            npc.walkable === false
        );
        if (blockingNPC) {
            // 移動できないが向きは変える
            this.playerDirection = direction;
            this.player.setTexture(this.idleFrames[direction]);
            return;
        }

        // ここまで来たら移動可能
        this.playerDirection = direction;
        this.player.play(animKey);

        // グリッド移動開始
        this.isMoving = true;
        this.player.gridX = newGridX;
        this.player.gridY = newGridY;

        const tileSize = this.currentMapData.tileSize;
        const targetX = newGridX * tileSize;
        const targetY = newGridY * tileSize;

        // スムーズに移動
        this.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: this.moveSpeed,
            ease: 'Linear',
            onComplete: async () => {
                this.isMoving = false;
                this.player.stop();
                this.player.setTexture(this.idleFrames[this.playerDirection]);

                // ワープポイントをチェック
                await this.checkWarp();

                // エンカウント判定
                this.checkEncounter();
            }
        });
    }

    async checkWarp() {
        const warps = this.currentMapData.warps || [];
        const warp = warps.find(w => w.x === this.player.gridX && w.y === this.player.gridY);

        if (warp) {
            console.log(`ワープポイント検出: ${warp.toMap} へ移動`);
            await this.loadAndRenderMap(warp.toMap, warp.toX, warp.toY);
        }
    }

    checkEncounter() {
        // エンカウントが無効の場合はスキップ
        if (!GameConfig.encounter.enabled) return;

        // 現在のタイルを取得
        const tileId = this.currentMapData.tiles[this.player.gridY][this.player.gridX];

        // エンカウント可能なタイルかチェック
        if (!GameConfig.encounter.encounterTiles.includes(tileId)) {
            return;
        }

        // 歩数をカウント
        this.stepCount++;
        console.log(`歩数: ${this.stepCount} / ${this.nextEncounter}`);

        // エンカウント判定
        if (this.stepCount >= this.nextEncounter) {
            this.stepCount = 0;
            this.nextEncounter = this.getRandomEncounterSteps();
            console.log('エンカウント発生！');
            this.startBattle();
        }
    }

    startBattle() {
        // バトルシーンに移行
        this.scene.start('BattleScene', {
            playerData: this.playerData,
            returnMap: this.currentMapData.id,
            returnX: this.player.gridX,
            returnY: this.player.gridY
        });
    }
}
