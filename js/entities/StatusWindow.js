// StatusWindow - ステータス詳細ウィンドウ
class StatusWindow {
    constructor(scene, playerData) {
        this.scene = scene;
        this.playerData = playerData;
        this.visible = false;

        this.createWindow();
    }

    createWindow() {
        const width = GameConfig.width - 40;
        const height = GameConfig.height - 60;
        const x = 20;
        const y = 30;

        // 背景
        this.background = this.scene.add.rectangle(x, y, width, height, 0x000080, 0.95);
        this.background.setOrigin(0, 0);
        this.background.setScrollFactor(0);
        this.background.setDepth(250);
        this.background.setVisible(false);

        // 枠
        this.border = this.scene.add.graphics();
        this.border.lineStyle(3, 0xffffff, 1);
        this.border.strokeRect(x, y, width, height);
        this.border.setScrollFactor(0);
        this.border.setDepth(250);
        this.border.setVisible(false);

        // タイトル
        this.titleText = this.scene.add.text(x + 10, y + 10, 'ステータス', {
            fontSize: '16px',
            fill: '#ffff00',
            fontStyle: 'bold'
        });
        this.titleText.setScrollFactor(0);
        this.titleText.setDepth(251);
        this.titleText.setVisible(false);

        // ステータス詳細テキスト
        this.statusText = this.scene.add.text(x + 20, y + 40, '', {
            fontSize: '12px',
            fill: '#ffffff',
            lineSpacing: 5
        });
        this.statusText.setScrollFactor(0);
        this.statusText.setDepth(251);
        this.statusText.setVisible(false);

        // 閉じる指示
        this.closeText = this.scene.add.text(
            x + width - 120,
            y + height - 25,
            'ESC/X: 戻る',
            {
                fontSize: '10px',
                fill: '#888888'
            }
        );
        this.closeText.setScrollFactor(0);
        this.closeText.setDepth(251);
        this.closeText.setVisible(false);
    }

    show() {
        this.visible = true;
        this.background.setVisible(true);
        this.border.setVisible(true);
        this.titleText.setVisible(true);
        this.statusText.setVisible(true);
        this.closeText.setVisible(true);

        this.updateStatus();
    }

    hide() {
        this.visible = false;
        this.background.setVisible(false);
        this.border.setVisible(false);
        this.titleText.setVisible(false);
        this.statusText.setVisible(false);
        this.closeText.setVisible(false);
    }

    updateStatus() {
        const p = this.playerData;
        const expToNext = p.nextExp - p.exp;

        this.statusText.setText([
            `名前:     ${p.name}`,
            '',
            `レベル:   ${p.level}`,
            '',
            `HP:       ${p.hp} / ${p.maxHp}`,
            `MP:       ${p.mp} / ${p.maxMp}`,
            '',
            `攻撃力:   ${p.attack}`,
            `守備力:   ${p.defense}`,
            `素早さ:   ${p.speed}`,
            '',
            `経験値:   ${p.exp}`,
            `次まで:   ${expToNext}`,
            '',
            `所持金:   ${p.gold} G`
        ]);
    }

    isVisible() {
        return this.visible;
    }
}
