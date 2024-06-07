import { Tilemaps } from "phaser";
import { Player } from "./Player";

let counter = 1;

export class HexTile {
    readonly tile: Tilemaps.Tile;
    player: Player;
    readonly order: number;
    readonly q: number;
    readonly r: number;
    readonly top: number;
    readonly left: number;
    readonly right: number;
    readonly bottom: number;

    constructor(
        pos: { q: number; r: number },
        player?: Player,
        tile?: Tilemaps.Tile
    ) {
        this.q = pos.q;
        this.r = pos.r;
        if (player) this.player = player;
        if (tile) {
            const { pixelX: left, pixelY: top, bottom, right } = tile;
            this.order = counter++;
            Object.assign(this, { tile, left, bottom, right, top });
        }
    }

    equals(other: HexTile) {
        return other.q == this.q && other.r == this.r;
    }

    tileFromColor = (color: number) => [2, 5, 3, 4, 1, 6][color];

    getOffset = (): { row: number; col: number } => ({
        col: this.q,
        row: this.r + (this.q - (this.q & 1)) / 2,
    });

    pos = () => ({ q: this.q, r: this.r });

    static fromOffset(
        pos: { row: number; col: number },
        player?: Player,
        tile?: Tilemaps.Tile
    ): HexTile {
        const q = pos.col;
        const r = pos.row - (pos.col - (pos.col & 1)) / 2;
        return new HexTile({ q, r }, player, tile);
    }

    place(map: Tilemaps.Tilemap, player: Player) {
        const offpos = this.getOffset();
        const tile = map.putTileAt(
            this.tileFromColor(player.color),
            offpos.col,
            offpos.row
        )!;
        return new HexTile(this.pos(), player, tile);
    }

    getNeighborCoords(): { q: number; r: number }[] {
        return [
            { q: this.q - 1, r: this.r },
            { q: this.q, r: this.r - 1 },
            { q: this.q + 1, r: this.r - 1 },
            { q: this.q + 1, r: this.r },
            { q: this.q, r: this.r + 1 },
            { q: this.q - 1, r: this.r + 1 },
        ].filter(({ q, r }) => {
            // Within Map Boundaries
            const { col, row } = { col: q, row: r + (q - (q & 1)) / 2 };
            return col > 0 && col < 100 && row > 0 && row < 100;
        });
    }
}

