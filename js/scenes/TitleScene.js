// TitleScene - タイトル画面
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        // 背景
        const bg = this.add.image(0, 0, 'background');
        bg.setOrigin(0, 0);
        bg.setDisplaySize(GameConfig.width, GameConfig.height);

        // タイトルテキスト
        const titleText = this.add.text(
            GameConfig.width / 2,
            GameConfig.height / 3,
            GameConfig.title,
            {
                fontSize: '32px',
                fill: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        titleText.setOrigin(0.5);

        // サブタイトル
        const subtitleText = this.add.text(
            GameConfig.width / 2,
            GameConfig.height / 2,
            'Dragon Quest Style RPG',
            {
                fontSize: '12px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        subtitleText.setOrigin(0.5);

        // スタート指示テキスト
        const startText = this.add.text(
            GameConfig.width / 2,
            GameConfig.height * 2 / 3,
            'Press SPACE or Click to Start',
            {
                fontSize: '10px',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        startText.setOrigin(0.5);

        // テキストを点滅させる
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // SPACEキーでゲーム開始
        this.input.keyboard.on('keydown-SPACE', () => {
            this.startGame();
        });

        // クリックでゲーム開始
        this.input.on('pointerdown', () => {
            this.startGame();
        });
    }

    startGame() {
        console.log('TitleScene: ゲーム開始 - FieldSceneへ遷移');
        this.scene.start('FieldScene');
    }
}
