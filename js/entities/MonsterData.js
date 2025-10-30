// MonsterData - モンスターのデータ定義
class MonsterData {
    static monsters = {
        slime: {
            name: 'スライム',
            hp: 8,
            maxHp: 8,
            attack: 3,
            defense: 2,
            exp: 3,
            gold: 5,
            sprite: 'npc_nurse' // 仮のスプライト（後で変更可能）
        },
        bat: {
            name: 'おおコウモリ',
            hp: 12,
            maxHp: 12,
            attack: 5,
            defense: 3,
            exp: 5,
            gold: 8,
            sprite: 'npc_nurse'
        },
        goblin: {
            name: 'ゴブリン',
            hp: 15,
            maxHp: 15,
            attack: 7,
            defense: 4,
            exp: 8,
            gold: 12,
            sprite: 'npc_nurse'
        }
    };

    static getRandomMonster() {
        const keys = Object.keys(this.monsters);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        // モンスターデータをコピーして返す
        return JSON.parse(JSON.stringify(this.monsters[randomKey]));
    }
}
