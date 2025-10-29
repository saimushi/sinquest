// PlayerData - プレイヤーのステータス管理
class PlayerData {
    constructor() {
        this.name = '勇者';
        this.level = 1;
        this.hp = 15;
        this.maxHp = 15;
        this.mp = 8;
        this.maxMp = 8;
        this.exp = 0;
        this.nextExp = 10;
        this.gold = 50;
        this.attack = 5;
        this.defense = 3;
        this.speed = 4;
    }

    // レベルアップ処理
    levelUp() {
        this.level++;
        this.maxHp += 5;
        this.hp = this.maxHp;
        this.maxMp += 3;
        this.mp = this.maxMp;
        this.attack += 2;
        this.defense += 1;
        this.speed += 1;
        this.nextExp = this.level * 10;
    }

    // 経験値獲得
    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.nextExp) {
            this.levelUp();
            return true; // レベルアップした
        }
        return false;
    }

    // お金獲得
    gainGold(amount) {
        this.gold += amount;
    }

    // ダメージを受ける
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp < 0) this.hp = 0;
        return this.hp <= 0; // 戦闘不能かどうか
    }

    // 回復
    heal(amount) {
        this.hp += amount;
        if (this.hp > this.maxHp) this.hp = this.maxHp;
    }

    // MP消費
    useMp(amount) {
        if (this.mp >= amount) {
            this.mp -= amount;
            return true;
        }
        return false;
    }

    // 完全回復
    fullRecover() {
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }
}
