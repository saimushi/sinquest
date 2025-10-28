// グローバルなバーチャル入力状態
window.VirtualInput = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false // Aボタン（インタラクション）
};

// メインゲームの初期化
window.onload = function() {
    const config = {
        type: Phaser.AUTO,
        width: GameConfig.width,
        height: GameConfig.height,
        zoom: GameConfig.scale,
        pixelArt: true, // ピクセルアートをシャープに表示
        backgroundColor: '#000000',
        parent: 'game-canvas-wrapper', // キャンバスの親要素を指定
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

    // バーチャル十字キーのイベント設定
    setupVirtualControls();
};

// バーチャルコントロールのセットアップ
function setupVirtualControls() {
    const buttons = document.querySelectorAll('.d-pad-button');

    buttons.forEach(button => {
        const direction = button.dataset.direction;

        // タッチスタート/マウスダウン
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            window.VirtualInput[direction] = true;
        });

        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            window.VirtualInput[direction] = true;
        });

        // タッチエンド/マウスアップ
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            window.VirtualInput[direction] = false;
        });

        button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            window.VirtualInput[direction] = false;
        });

        // タッチキャンセル
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            window.VirtualInput[direction] = false;
        });

        // マウスが離れた時
        button.addEventListener('mouseleave', (e) => {
            window.VirtualInput[direction] = false;
        });
    });

    // Aボタン（インタラクション）
    const actionButton = document.getElementById('btn-action');
    if (actionButton) {
        actionButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            window.VirtualInput.action = true;
        });

        actionButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            window.VirtualInput.action = true;
        });

        actionButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            window.VirtualInput.action = false;
        });

        actionButton.addEventListener('mouseup', (e) => {
            e.preventDefault();
            window.VirtualInput.action = false;
        });
    }
}
