// ゲームの基本設定
const GameConfig = {
    // 画面サイズ（ドラクエ風のクラシックなサイズ）
    width: 320,
    height: 240,
    scale: 2.5, // 実際の表示サイズは 800x600

    // タイルサイズ
    tileSize: 16,

    // プレイヤー設定
    player: {
        speed: 2, // 移動速度（ピクセル/フレーム）
        startX: 160,
        startY: 120
    },

    // ゲームタイトル
    title: 'SinQuest',

    // 経験値システム（オンオフ可能）
    expEnabled: true,

    // エンカウント設定
    encounter: {
        enabled: true,
        minSteps: 5,
        maxSteps: 10,
        encounterTiles: [0] // 草地（タイルID 0）でエンカウント
    }
};
