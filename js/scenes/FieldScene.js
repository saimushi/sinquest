// FieldScene - フィールドマップとキャラクター移動
class FieldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FieldScene' });
        this.player = null;
        this.cursors = null;
        this.isMoving = false; // グリッド移動中かどうか
        this.moveSpeed = 150; // グリッド移動のスピード（ms）
        this.playerDirection = 'down'; // プレイヤーの現在の向き
        this.npcs = []; // NPCリスト
        this.messageWindow = null; // メッセージウィンドウ
        this.interactKey = null; // インタラクションキー
        this.actionPressed = false; // Aボタン押下状態管理
    }

    create() {
        console.log('FieldScene: フィールド作成開始');

        // マップサイズ（タイル数）
        const mapWidth = 30;
        const mapHeight = 30;
        const tileSize = GameConfig.tileSize;

        // 簡単なマップデータを作成（後でJSONファイルなどから読み込むように拡張可能）
        this.createMap(mapWidth, mapHeight, tileSize);

        // 歩行アニメーションを作成
        this.createAnimations();

        // プレイヤーキャラクターを作成
        this.createPlayer();

        // カメラ設定
        this.cameras.main.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // NPCを配置
        this.createNPCs();

        // メッセージウィンドウを作成
        this.messageWindow = new MessageWindow(this);

        // キーボード入力
        this.cursors = this.input.keyboard.createCursorKeys();
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // デバッグ情報表示
        this.debugText = this.add.text(10, 10, '', {
            fontSize: '10px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });
        this.debugText.setScrollFactor(0); // カメラに追従しない
    }

    createNPCs() {
        const tileSize = GameConfig.tileSize;

        // NPC1: 看護師（城の近く）
        const npc1 = {
            sprite: this.add.sprite(12 * tileSize, 12 * tileSize, 'npc_nurse'),
            gridX: 12,
            gridY: 12,
            message: 'ようこそ、SinQuestの世界へ！\nここは冒険の始まりの地です。'
        };
        npc1.sprite.setOrigin(0, 0);
        npc1.sprite.setDisplaySize(tileSize, tileSize);
        this.npcs.push(npc1);

        // NPC2: 看護師（別の場所）
        const npc2 = {
            sprite: this.add.sprite(18 * tileSize, 10 * tileSize, 'npc_nurse'),
            gridX: 18,
            gridY: 10,
            message: '北には危険なモンスターが\nいると聞きました。\n気をつけてくださいね！'
        };
        npc2.sprite.setOrigin(0, 0);
        npc2.sprite.setDisplaySize(tileSize, tileSize);
        this.npcs.push(npc2);
    }

    createAnimations() {
        // 下方向の歩行アニメーション (brave_01, 02, 03)
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

        // 左方向の歩行アニメーション (brave_04, 05, 06)
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

        // 右方向の歩行アニメーション (brave_07, 08, 09)
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

        // 上方向の歩行アニメーション (brave_10, 11, 12)
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

        // アイドル（立ち）状態のフレーム
        this.idleFrames = {
            down: 'player_1',
            left: 'player_4',
            right: 'player_7',
            up: 'player_10'
        };
    }

    createMap(mapWidth, mapHeight, tileSize) {
        // シンプルなマップを生成
        // 0: 草, 1: 水, 2: 石, 3: 城
        const mapData = [];

        for (let y = 0; y < mapHeight; y++) {
            mapData[y] = [];
            for (let x = 0; x < mapWidth; x++) {
                // 外周を水にする
                if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
                    mapData[y][x] = 1; // 水
                }
                // 中央付近に城を配置
                else if (x >= 14 && x <= 16 && y >= 14 && y <= 16) {
                    mapData[y][x] = 3; // 城
                }
                // ランダムに石を配置
                else if (Math.random() < 0.05) {
                    mapData[y][x] = 2; // 石
                }
                // それ以外は草
                else {
                    mapData[y][x] = 0; // 草
                }
            }
        }

        // マップを描画
        this.mapData = mapData;
        this.tiles = [];

        for (let y = 0; y < mapHeight; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < mapWidth; x++) {
                const tileType = mapData[y][x];
                let tileKey = 'grass';

                switch(tileType) {
                    case 1: tileKey = 'water'; break;
                    case 2: tileKey = 'stone'; break;
                    case 3: tileKey = 'castle'; break;
                }

                const tile = this.add.image(x * tileSize, y * tileSize, tileKey);
                tile.setOrigin(0, 0);
                tile.setDisplaySize(tileSize, tileSize);
                this.tiles[y][x] = { sprite: tile, type: tileType };
            }
        }
    }

    createPlayer() {
        const tileSize = GameConfig.tileSize;
        // プレイヤーを中央に配置
        const startX = 15 * tileSize;
        const startY = 10 * tileSize;

        // spriteを使用してアニメーション対応
        this.player = this.add.sprite(startX, startY, 'player_1');
        this.player.setOrigin(0, 0);
        this.player.setDisplaySize(tileSize, tileSize);

        // プレイヤーのグリッド座標を保持
        this.player.gridX = 15;
        this.player.gridY = 10;
    }

    update() {
        if (!this.player) return;

        // メッセージウィンドウが表示されている場合
        if (this.messageWindow && this.messageWindow.isVisible()) {
            // SPACEキーまたはAボタンでメッセージ送り/閉じる
            if (Phaser.Input.Keyboard.JustDown(this.interactKey) ||
                (window.VirtualInput.action && !this.actionPressed)) {
                this.messageWindow.skipTyping();
                this.actionPressed = true;
            }
            if (!window.VirtualInput.action) {
                this.actionPressed = false;
            }
            return; // 会話中は移動不可
        }

        // 移動中は他の操作不可
        if (this.isMoving) return;

        // SPACEキーまたはAボタンでNPCと会話
        if (Phaser.Input.Keyboard.JustDown(this.interactKey) ||
            (window.VirtualInput.action && !this.actionPressed)) {
            this.tryInteract();
            this.actionPressed = true;
        }
        if (!window.VirtualInput.action) {
            this.actionPressed = false;
        }

        // 方向キー入力をチェック（キーボード + バーチャル十字キー）
        let moveX = 0;
        let moveY = 0;

        // キーボード入力
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
                               ? 'Touch Controls' : 'Arrow Keys';

        this.debugText.setText([
            `Position: (${this.player.gridX}, ${this.player.gridY})`,
            `Tile: ${this.getTileTypeAt(this.player.gridX, this.player.gridY)}`,
            `Direction: ${this.playerDirection}`,
            `Control: ${controlMethod}`,
            `Press SPACE to talk`
        ]);
    }

    tryInteract() {
        // プレイヤーが向いている方向の座標を計算
        let targetX = this.player.gridX;
        let targetY = this.player.gridY;

        switch(this.playerDirection) {
            case 'up': targetY -= 1; break;
            case 'down': targetY += 1; break;
            case 'left': targetX -= 1; break;
            case 'right': targetX += 1; break;
        }

        // その座標にNPCがいるかチェック
        const npc = this.npcs.find(n => n.gridX === targetX && n.gridY === targetY);

        if (npc) {
            // NPCと会話開始
            this.messageWindow.show(npc.message);
        }
    }

    movePlayer(dx, dy) {
        const newGridX = this.player.gridX + dx;
        const newGridY = this.player.gridY + dy;

        // マップ範囲チェック
        if (newGridX < 0 || newGridX >= this.mapData[0].length ||
            newGridY < 0 || newGridY >= this.mapData.length) {
            return;
        }

        // 移動可能かチェック（水や障害物には入れない）
        if (!this.canWalkOn(newGridX, newGridY)) {
            console.log('移動不可: 障害物');
            return;
        }

        // 移動方向を判定してアニメーションを設定
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

        this.playerDirection = direction;

        // 歩行アニメーションを再生
        this.player.play(animKey);

        // グリッド移動開始
        this.isMoving = true;
        this.player.gridX = newGridX;
        this.player.gridY = newGridY;

        const tileSize = GameConfig.tileSize;
        const targetX = newGridX * tileSize;
        const targetY = newGridY * tileSize;

        // スムーズに移動
        this.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: this.moveSpeed,
            ease: 'Linear',
            onComplete: () => {
                this.isMoving = false;
                // アニメーション停止してアイドルフレームに戻す
                this.player.stop();
                this.player.setTexture(this.idleFrames[this.playerDirection]);
            }
        });
    }

    canWalkOn(gridX, gridY) {
        const tileType = this.mapData[gridY][gridX];
        // 水(1)と城(3)には入れない
        return tileType !== 1 && tileType !== 3;
    }

    getTileTypeAt(gridX, gridY) {
        const tileType = this.mapData[gridY][gridX];
        const names = ['Grass', 'Water', 'Stone', 'Castle'];
        return names[tileType] || 'Unknown';
    }
}
