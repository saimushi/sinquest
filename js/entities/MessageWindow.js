// MessageWindow - ドラクエ風のメッセージウィンドウ
class MessageWindow {
    constructor(scene) {
        this.scene = scene;
        this.visible = false;
        this.currentText = '';
        this.fullText = '';
        this.charIndex = 0;
        this.textSpeed = 50; // 1文字表示する間隔（ms）
        this.isTyping = false;
        this.callback = null;

        this.createWindow();
    }

    createWindow() {
        const width = GameConfig.width - 20;
        const height = 60;
        const x = 10;
        const y = GameConfig.height - height - 10;

        // ウィンドウ背景
        this.background = this.scene.add.rectangle(x, y, width, height, 0x000000, 0.8);
        this.background.setOrigin(0, 0);
        this.background.setScrollFactor(0);
        this.background.setDepth(100);
        this.background.setVisible(false);

        // ウィンドウ枠
        this.border = this.scene.add.graphics();
        this.border.lineStyle(2, 0xffffff, 1);
        this.border.strokeRect(x, y, width, height);
        this.border.setScrollFactor(0);
        this.border.setDepth(100);
        this.border.setVisible(false);

        // テキスト表示
        this.textObject = this.scene.add.text(x + 10, y + 10, '', {
            fontSize: '12px',
            fill: '#ffffff',
            wordWrap: { width: width - 20 }
        });
        this.textObject.setScrollFactor(0);
        this.textObject.setDepth(101);
        this.textObject.setVisible(false);

        // 続きがあることを示す矢印
        this.arrow = this.scene.add.text(x + width - 20, y + height - 20, '▼', {
            fontSize: '12px',
            fill: '#ffffff'
        });
        this.arrow.setScrollFactor(0);
        this.arrow.setDepth(101);
        this.arrow.setVisible(false);

        // 矢印の点滅アニメーション
        this.scene.tweens.add({
            targets: this.arrow,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    show(text, callback = null) {
        this.fullText = text;
        this.currentText = '';
        this.charIndex = 0;
        this.callback = callback;
        this.visible = true;
        this.isTyping = true;

        // ウィンドウを表示
        this.background.setVisible(true);
        this.border.setVisible(true);
        this.textObject.setVisible(true);
        this.arrow.setVisible(false);

        // テキストを1文字ずつ表示
        this.typeText();
    }

    typeText() {
        if (this.charIndex < this.fullText.length) {
            this.currentText += this.fullText[this.charIndex];
            this.textObject.setText(this.currentText);
            this.charIndex++;

            // 次の文字を表示
            this.scene.time.delayedCall(this.textSpeed, () => {
                this.typeText();
            });
        } else {
            // テキスト表示完了
            this.isTyping = false;
            this.arrow.setVisible(true);
        }
    }

    skipTyping() {
        if (this.isTyping) {
            // 全文を一気に表示
            this.currentText = this.fullText;
            this.textObject.setText(this.currentText);
            this.charIndex = this.fullText.length;
            this.isTyping = false;
            this.arrow.setVisible(true);
        } else {
            // 次のメッセージへ、または閉じる
            this.hide();
            if (this.callback) {
                this.callback();
            }
        }
    }

    hide() {
        this.visible = false;
        this.background.setVisible(false);
        this.border.setVisible(false);
        this.textObject.setVisible(false);
        this.arrow.setVisible(false);
        this.currentText = '';
        this.fullText = '';
        this.charIndex = 0;
    }

    isVisible() {
        return this.visible;
    }

    isStillTyping() {
        return this.isTyping;
    }
}
