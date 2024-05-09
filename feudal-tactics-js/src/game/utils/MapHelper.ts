import { Player, PlayerTypes } from "./Player";
export class GameMap {
    map: Phaser.Tilemaps.Tilemap;
    tileList: Phaser.Tilemaps.Tile[] = [];
    seed: number;
    landMass: number;
    density: number;
    players: Player[];
    constructor(
        map: Phaser.Tilemaps.Tilemap,
        seed = 42,
        landMass = 42,
        density = 0
    ) {
        this.map = map;
        this.seed = seed;
        this.landMass = landMass;
        this.density = density;
        const HP = new Player(0, PlayerTypes.HUMAN);
        const P1 = new Player(1, PlayerTypes.AI);
        const P2 = new Player(2, PlayerTypes.AI);
        const P3 = new Player(3, PlayerTypes.AI);
        const P4 = new Player(4, PlayerTypes.AI);
        const P5 = new Player(5, PlayerTypes.AI);
        this.players = [HP, P1, P2, P3, P4, P5];
    }
    GenerateMap() {
        this.generateTiles();
    }
    tileFromColor(color: number) {
        const playerTileIndex = [2, 3, 4, 5, 6, 1];
        return playerTileIndex[color];
    }
    axial_to_offset(pos: { x: number; y: number }): {
        x: number;
        y: number;
    } {
        const x = pos.x;
        const y = pos.y + (pos.x - (pos.x & 1)) / 2;
        return { x, y };
    }
    offset_to_axial(pos: { x: number; y: number }): {
        x: number;
        y: number;
    } {
        const x = pos.x;
        const y = pos.y - (pos.x - (pos.x & 1)) / 2;
        return { x, y };
    }
    placeTile(pos: { x: number; y: number }, color: number) {
        const offpos = this.axial_to_offset(pos);
        return this.map.putTileAt(
            this.tileFromColor(color),
            offpos.x,
            offpos.y
        )!;
    }
    generateTiles() {
        const tileAmountsToGenerate = new Map<Player, number>();
        const players = this.players.slice().sort(() => Math.random() - 0.5); // Shuffle players
        let remainingLandMass = this.landMass % players.length;
        players.forEach((player) => {
            const additionalTiles = remainingLandMass > 0 ? 1 : 0;
            tileAmountsToGenerate.set(
                player,
                Math.floor(this.landMass / players.length) + additionalTiles
            );
            if (remainingLandMass > 0) remainingLandMass--;
        });
        const remainingPlayers = players.slice();
        let nextTilePos = this.offset_to_axial({ x: 50, y: 50 });
        const positionHistory: { x: number; y: number }[] = [];

        while (remainingPlayers.length > 0) {
            const currentTilePos = { ...nextTilePos };
            const playerIndex = Math.floor(
                Math.random() * remainingPlayers.length
            );
            const player = remainingPlayers[playerIndex];
            this.tileList.push(this.placeTile(currentTilePos, player.color));
            if (tileAmountsToGenerate.get(player) === 1) {
                remainingPlayers.splice(playerIndex, 1);
            } else {
                tileAmountsToGenerate.set(
                    player,
                    tileAmountsToGenerate.get(player)! - 1
                );
            }
            positionHistory.push({ ...currentTilePos });
            let usableCoords = this.getUnusedNeighborCoords(currentTilePos);
            while (usableCoords.length === 0) {
                const lastPos = positionHistory.pop()!;
                currentTilePos.x = lastPos.x;
                currentTilePos.y = lastPos.y;
                usableCoords = this.getUnusedNeighborCoords(currentTilePos);
            }
            const scores = usableCoords.map((candidate) =>
                Math.pow(
                    this.getUnusedNeighborCoords(candidate).length,
                    this.density
                )
            );
            const scoreSum = scores.reduce((sum, score) => sum + score, 0);
            const randomScore = Math.random() * scoreSum;
            let index = 0;
            let countedScore = scores[0];
            while (countedScore < randomScore) {
                index++;
                countedScore += scores[index];
            }
            nextTilePos = { ...usableCoords[index] };
        }
    }
    getNeighborCoords(tileCoords: {
        x: number;
        y: number;
    }): { x: number; y: number }[] {
        const { x, y } = tileCoords;
        return [
            { x: x - 1, y: y },
            { x: x, y: y - 1 },
            { x: x + 1, y: y - 1 },
            { x: x + 1, y: y },
            { x: x, y: y + 1 },
            { x: x - 1, y: y + 1 },
        ];
    }
    isUnusedTile(pos: { x: number; y: number }): boolean {
        const offpos = this.axial_to_offset(pos);
        if (
            offpos.x <= 0 ||
            offpos.y <= 0 ||
            offpos.x >= 100 ||
            offpos.y >= 100
        )
            return false;
        return !this.map.hasTileAt(offpos.x, offpos.y);
    }
    getUnusedNeighborCoords(tileCoords: {
        x: number;
        y: number;
    }): { x: number; y: number }[] {
        const neighbors: { x: number; y: number }[] =
            this.getNeighborCoords(tileCoords);
        const unusedNeighbors: { x: number; y: number }[] = [];
        for (const neighbor of neighbors) {
            if (this.isUnusedTile(neighbor)) {
                unusedNeighbors.push(neighbor);
            }
        }
        return unusedNeighbors;
    }
}

