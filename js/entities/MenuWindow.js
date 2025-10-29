// MenuWindow - ドラクエ風のメニューウィンドウ
class MenuWindow {
    constructor(scene, playerData) {
        this.scene = scene;
        this.playerData = playerData;
        this.visible = false;
        this.currentIndex = 0;
        this.menuItems = [
            { text: 'ステータス', action: 'status' },
            { text: 'アイテム', action: 'item' },
            { text: '装備', action: 'equip' },
            { text: 'セーブ', action: 'save' },
            { text: '閉じる', action: 'close' }
        ];

        this.createWindow();
        this.createStatusWindow();
    }

    createWindow() {
        const width = 140;
        const height = 180;
        const x = GameConfig.width - width - 10;
        const y = 30;

        // メインウィンドウ背景
        this.background = this.scene.add.rectangle(x, y, width, height, 0x000080, 0.9);
        this.background.setOrigin(0, 0);
        this.background.setScrollFactor(0);
        this.background.setDepth(200);
        this.background.setVisible(false);

        // ウィンドウ枠
        this.border = this.scene.add.graphics();
        this.border.lineStyle(2, 0xffffff, 1);
        this.border.strokeRect(x, y, width, height);
        this.border.setScrollFactor(0);
        this.border.setDepth(200);
        this.border.setVisible(false);

        // タイトル
        this.titleText = this.scene.add.text(x + 10, y + 10, 'メニュー', {
            fontSize: '14px',
            fill: '#ffff00',
            fontStyle: 'bold'
        });
        this.titleText.setScrollFactor(0);
        this.titleText.setDepth(201);
        this.titleText.setVisible(false);

        // メニュー項目
        this.menuTexts = [];
        this.menuItems.forEach((item, index) => {
            const text = this.scene.add.text(
                x + 20,
                y + 40 + (index * 25),
                item.text,
                {
                    fontSize: '12px',
                    fill: '#ffffff'
                }
            );
            text.setScrollFactor(0);
            text.setDepth(201);
            text.setVisible(false);
            this.menuTexts.push(text);
        });

        // カーソル（▶）
        this.cursor = this.scene.add.text(x + 10, y + 40, '▶', {
            fontSize: '12px',
            fill: '#ffff00'
        });
        this.cursor.setScrollFactor(0);
        this.cursor.setDepth(201);
        this.cursor.setVisible(false);
    }

    createStatusWindow() {
        const width = 140;
        const height = 100;
        const x = 10;
        const y = 30;

        // ステータスウィンドウ背景
        this.statusBg = this.scene.add.rectangle(x, y, width, height, 0x000080, 0.9);
        this.statusBg.setOrigin(0, 0);
        this.statusBg.setScrollFactor(0);
        this.statusBg.setDepth(200);
        this.statusBg.setVisible(false);

        // ウィンドウ枠
        this.statusBorder = this.scene.add.graphics();
        this.statusBorder.lineStyle(2, 0xffffff, 1);
        this.statusBorder.strokeRect(x, y, width, height);
        this.statusBorder.setScrollFactor(0);
        this.statusBorder.setDepth(200);
        this.statusBorder.setVisible(false);

        // ステータステキスト
        this.statusText = this.scene.add.text(x + 10, y + 10, '', {
            fontSize: '11px',
            fill: '#ffffff',
            lineSpacing: 2
        });
        this.statusText.setScrollFactor(0);
        this.statusText.setDepth(201);
        this.statusText.setVisible(false);
    }

    show() {
        this.visible = true;
        this.currentIndex = 0;

        // メインウィンドウ表示
        this.background.setVisible(true);
        this.border.setVisible(true);
        this.titleText.setVisible(true);
        this.cursor.setVisible(true);
        this.menuTexts.forEach(text => text.setVisible(true));

        // ステータスウィンドウ表示
        this.statusBg.setVisible(true);
        this.statusBorder.setVisible(true);
        this.statusText.setVisible(true);

        this.updateCursor();
        this.updateStatus();
    }

    hide() {
        this.visible = false;

        // メインウィンドウ非表示
        this.background.setVisible(false);
        this.border.setVisible(false);
        this.titleText.setVisible(false);
        this.cursor.setVisible(false);
        this.menuTexts.forEach(text => text.setVisible(false));

        // ステータスウィンドウ非表示
        this.statusBg.setVisible(false);
        this.statusBorder.setVisible(false);
        this.statusText.setVisible(false);
    }

    updateCursor() {
        const x = GameConfig.width - 140 - 10;
        const y = 30;
        this.cursor.setPosition(x + 10, y + 40 + (this.currentIndex * 25));
    }

    updateStatus() {
        const p = this.playerData;
        this.statusText.setText([
            `${p.name}`,
            `Lv ${p.level}`,
            `HP ${p.hp}/${p.maxHp}`,
            `MP ${p.mp}/${p.maxMp}`,
            `G  ${p.gold}`
        ]);
    }

    moveUp() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCursor();
        }
    }

    moveDown() {
        if (this.currentIndex < this.menuItems.length - 1) {
            this.currentIndex++;
            this.updateCursor();
        }
    }

    select() {
        const action = this.menuItems[this.currentIndex].action;
        return action;
    }

    isVisible() {
        return this.visible;
    }
}
