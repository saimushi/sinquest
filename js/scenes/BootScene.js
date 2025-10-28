// BootScene - ゲーム起動時にアセットを読み込むシーン
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // ローディングテキスト表示
        const loadingText = this.add.text(
            GameConfig.width / 2,
            GameConfig.height / 2,
            'Loading...',
            {
                fontSize: '16px',
                fill: '#ffffff'
            }
        );
        loadingText.setOrigin(0.5);

        // プログレスバー
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(40, 130, 240, 20);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(42, 132, 236 * value, 16);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // キャラクターチップ（プレイヤー）
        // brave_01.png を使用（勇者）
        this.load.image('player', 'assets/charachip/character_01/brave_01.png');

        // マップチップ（地形タイル）
        // 実際に存在するファイル名を使用
        this.load.image('grass', 'assets/mapchip/ground_01.png');
        this.load.image('water', 'assets/mapchip/ocean_01.png');
        this.load.image('stone', 'assets/mapchip/mountain_01.png');
        this.load.image('castle', 'assets/mapchip/castle_01.png');

        // 背景
        this.load.image('background', 'assets/background/back_01.png');

        // アイコンチップ（将来のUI用）
        // this.load.image('icons', 'assets/iconchip/icon_01.png');
    }

    create() {
        console.log('BootScene: アセット読み込み完了');
        // タイトルシーンへ遷移
        this.scene.start('TitleScene');
    }
}
