// BattleScene - ドラクエ風のターン制バトル
class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
        this.playerData = null;
        this.monster = null;
        this.messageWindow = null;
        this.commandWindow = null;
        this.currentCommand = 0;
        this.returnData = null;
        this.actionPressed = false;
        this.upPressed = false;
        this.downPressed = false;
    }

    init(data) {
        this.playerData = data.playerData;
        this.returnData = {
            mapId: data.returnMap,
            x: data.returnX,
            y: data.returnY
        };
    }

    create() {
        console.log('BattleScene: バトル開始');

        // ランダムなモンスターを出現させる
        this.monster = MonsterData.getRandomMonster();

        // 背景
        this.add.rectangle(0, 0, GameConfig.width, GameConfig.height, 0x000000, 1)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // モンスター表示
        this.monsterSprite = this.add.sprite(
            GameConfig.width / 2,
            80,
            this.monster.sprite
        );
        this.monsterSprite.setDisplaySize(32, 32);
        this.monsterSprite.setScrollFactor(0);

        // モンスター名
        this.monsterNameText = this.add.text(
            GameConfig.width / 2,
            120,
            this.monster.name,
            {
                fontSize: '14px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }
        );
        this.monsterNameText.setOrigin(0.5, 0);
        this.monsterNameText.setScrollFactor(0);

        // プレイヤーステータス表示
        this.createStatusDisplay();

        // コマンドウィンドウ
        this.createCommandWindow();

        // メッセージウィンドウを作成
        this.messageWindow = new MessageWindow(this);

        // キーボード入力
        this.cursors = this.input.keyboard.createCursorKeys();
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // 戦闘開始メッセージ
        this.messageWindow.show(`${this.monster.name}が あらわれた！`, () => {
            this.showCommands();
        });
    }

    createStatusDisplay() {
        const x = 10;
        const y = 150;

        this.statusText = this.add.text(x, y, '', {
            fontSize: '11px',
            fill: '#ffffff',
            lineSpacing: 2
        });
        this.statusText.setScrollFactor(0);
        this.updateStatusDisplay();
    }

    updateStatusDisplay() {
        this.statusText.setText([
            `${this.playerData.name}`,
            `HP: ${this.playerData.hp}/${this.playerData.maxHp}`,
            `MP: ${this.playerData.mp}/${this.playerData.maxMp}`
        ]);
    }

    createCommandWindow() {
        const width = 120;
        const height = 70;
        const x = GameConfig.width - width - 10;
        const y = GameConfig.height - height - 10;

        // 背景
        this.commandBg = this.add.rectangle(x, y, width, height, 0x000000, 0.9);
        this.commandBg.setOrigin(0, 0);
        this.commandBg.setScrollFactor(0);
        this.commandBg.setVisible(false);

        // 枠
        this.commandBorder = this.add.graphics();
        this.commandBorder.lineStyle(2, 0xffffff, 1);
        this.commandBorder.strokeRect(x, y, width, height);
        this.commandBorder.setScrollFactor(0);
        this.commandBorder.setVisible(false);

        // コマンドテキスト
        this.commands = ['たたかう', 'にげる'];
        this.commandTexts = [];

        this.commands.forEach((cmd, index) => {
            const text = this.add.text(x + 30, y + 15 + index * 25, cmd, {
                fontSize: '12px',
                fill: '#ffffff'
            });
            text.setScrollFactor(0);
            text.setVisible(false);
            this.commandTexts.push(text);
        });

        // カーソル
        this.cursor = this.add.text(x + 15, y + 15, '▶', {
            fontSize: '12px',
            fill: '#ffff00'
        });
        this.cursor.setScrollFactor(0);
        this.cursor.setVisible(false);
    }

    showCommands() {
        this.commandBg.setVisible(true);
        this.commandBorder.setVisible(true);
        this.cursor.setVisible(true);
        this.commandTexts.forEach(text => text.setVisible(true));
        this.updateCursor();
    }

    hideCommands() {
        this.commandBg.setVisible(false);
        this.commandBorder.setVisible(false);
        this.cursor.setVisible(false);
        this.commandTexts.forEach(text => text.setVisible(false));
    }

    updateCursor() {
        const y = GameConfig.height - 80 + this.currentCommand * 25;
        this.cursor.setY(y);
    }

    update() {
        // メッセージウィンドウ表示中はコマンド操作不可
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

        // コマンド選択
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            (window.VirtualInput.up && !this.upPressed)) {
            this.currentCommand = (this.currentCommand - 1 + this.commands.length) % this.commands.length;
            this.updateCursor();
            this.upPressed = true;
        }
        if (!window.VirtualInput.up) {
            this.upPressed = false;
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
            (window.VirtualInput.down && !this.downPressed)) {
            this.currentCommand = (this.currentCommand + 1) % this.commands.length;
            this.updateCursor();
            this.downPressed = true;
        }
        if (!window.VirtualInput.down) {
            this.downPressed = false;
        }

        // コマンド決定
        if (Phaser.Input.Keyboard.JustDown(this.interactKey) ||
            (window.VirtualInput.action && !this.actionPressed)) {
            this.executeCommand(this.currentCommand);
            this.actionPressed = true;
        }
        if (!window.VirtualInput.action) {
            this.actionPressed = false;
        }
    }

    executeCommand(index) {
        this.hideCommands();

        switch(index) {
            case 0: // たたかう
                this.playerAttack();
                break;
            case 1: // にげる
                this.tryEscape();
                break;
        }
    }

    playerAttack() {
        const damage = Math.max(1, this.playerData.attack - this.monster.defense + Math.floor(Math.random() * 3));
        this.monster.hp = Math.max(0, this.monster.hp - damage);

        this.messageWindow.show(`${this.playerData.name}の こうげき！\n${this.monster.name}に ${damage}の ダメージ！`, () => {
            if (this.monster.hp <= 0) {
                this.monsterDefeated();
            } else {
                this.monsterAttack();
            }
        });
    }

    monsterAttack() {
        const damage = Math.max(1, this.monster.attack - this.playerData.defense + Math.floor(Math.random() * 3));
        this.playerData.hp = Math.max(0, this.playerData.hp - damage);
        this.updateStatusDisplay();

        this.messageWindow.show(`${this.monster.name}の こうげき！\n${this.playerData.name}は ${damage}の ダメージを うけた！`, () => {
            if (this.playerData.hp <= 0) {
                this.gameOver();
            } else {
                this.showCommands();
            }
        });
    }

    monsterDefeated() {
        const exp = this.monster.exp;
        const gold = this.monster.gold;

        // 経験値システムがONの場合のみ経験値を獲得
        let message = `${this.monster.name}を たおした！\n${gold}ゴールドを てにいれた！`;

        if (this.playerData.expEnabled) {
            this.playerData.exp += exp;
            this.playerData.gold += gold;
            message = `${this.monster.name}を たおした！\n${exp}の けいけんちと\n${gold}ゴールドを てにいれた！`;

            // レベルアップ判定
            if (this.playerData.exp >= this.playerData.nextExp) {
                this.playerData.levelUp();
                message += `\n\nレベルが あがった！\nレベル ${this.playerData.level}に なった！`;
            }
        } else {
            this.playerData.gold += gold;
        }

        this.messageWindow.show(message, () => {
            this.returnToField();
        });
    }

    tryEscape() {
        // 50%の確率で逃走成功
        if (Math.random() < 0.5) {
            this.messageWindow.show('うまく にげきれた！', () => {
                this.returnToField();
            });
        } else {
            this.messageWindow.show('しかし まわりこまれて\nしまった！', () => {
                this.monsterAttack();
            });
        }
    }

    gameOver() {
        this.messageWindow.show(`${this.playerData.name}は ちからつきた…`, () => {
            // タイトル画面に戻る
            this.scene.start('TitleScene');
        });
    }

    returnToField() {
        this.scene.start('FieldScene');
    }
}
