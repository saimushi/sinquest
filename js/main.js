// メインゲームの初期化
window.onload = function() {
    const config = {
        type: Phaser.AUTO,
        width: GameConfig.width,
        height: GameConfig.height,
        zoom: GameConfig.scale,
        pixelArt: true, // ピクセルアートをシャープに表示
        backgroundColor: '#000000',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }, // トップダウンビューなので重力なし
                debug: false
            }
        },
        scene: [
            BootScene,
            TitleScene,
            FieldScene
        ]
    };

    const game = new Phaser.Game(config);
};
