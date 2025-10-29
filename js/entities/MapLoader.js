// MapLoader - マップデータの読み込みと管理
class MapLoader {
    constructor() {
        this.maps = {}; // キャッシュ
    }

    // マップJSONを読み込む
    async loadMap(mapId) {
        // キャッシュにあれば返す
        if (this.maps[mapId]) {
            return this.maps[mapId];
        }

        try {
            const response = await fetch(`maps/${mapId}.json`);
            if (!response.ok) {
                throw new Error(`マップ '${mapId}' の読み込みに失敗しました`);
            }
            const mapData = await response.json();

            // キャッシュに保存
            this.maps[mapId] = mapData;

            console.log(`マップ '${mapData.name}' を読み込みました`);
            return mapData;
        } catch (error) {
            console.error(`マップ読み込みエラー:`, error);
            throw error;
        }
    }

    // タイルIDから対応するスプライトキーを返す
    getTileKey(tileId) {
        const tileMap = {
            0: 'grass',
            1: 'water',
            2: 'stone',
            3: 'castle',
            4: 'castle', // 城の入口（見た目は城）
            5: 'castle', // 建物の入口（見た目は城）
            6: 'grass'   // 出口（見た目は草）
        };
        return tileMap[tileId] || 'grass';
    }

    // タイルが通行可能かチェック
    canWalkOn(tileId) {
        const walkable = [0, 4, 5, 6]; // 草、各種ワープポイント
        return walkable.includes(tileId);
    }

    // タイルの名前を取得
    getTileName(tileId) {
        const names = {
            0: 'Grass',
            1: 'Water',
            2: 'Stone',
            3: 'Castle',
            4: 'Entrance',
            5: 'Door',
            6: 'Exit'
        };
        return names[tileId] || 'Unknown';
    }
}
