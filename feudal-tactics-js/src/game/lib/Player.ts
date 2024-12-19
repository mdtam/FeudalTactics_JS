export enum PlayerTypes {
    HUMAN,
    AI,
}

export class Player {
    color: number;
    type: PlayerTypes;
    defeated: boolean;
    constructor(color: number, type: PlayerTypes, defeated = false) {
        this.color = color;
        this.type = type;
        this.defeated = defeated;
    }

    getColor() {
        return this.color;
    }

    isDefeated() {
        return this.defeated;
    }

    setDefeated(defeated: boolean) {
        this.defeated = defeated;
    }

    getType() {
        return this.type;
    }

    equals(obj: Player) {
        if (this === obj) {
            return true;
        }
        if (obj == null || this.constructor !== obj.constructor) {
            return false;
        }
        const other = obj;
        return (
            this.color === other.color &&
            this.defeated === other.defeated &&
            this.type === other.type
        );
    }

    toString() {
        return `Player [color=${this.color}, type=${this.type}, defeated=${this.defeated}]`;
    }
}

