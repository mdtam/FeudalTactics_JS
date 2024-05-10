import { Player, PlayerTypes } from "./Player";
import { Random } from "./Random";
export class GameMap {
    map: Phaser.Tilemaps.Tilemap;
    tileList: Phaser.Tilemaps.Tile[] = [];
    seed: number;
    landMass: number;
    density: number;
    players: Player[];
    rng: Random;
    border = { top: 20000, bottom: 0, left: 20000, right: 0 };
    constructor(
        map: Phaser.Tilemaps.Tilemap,
        seed = 42,
        landMass = 42,
        density = 0
    ) {
        this.map = map;
        this.setSeed(seed);
        this.landMass = landMass;
        this.density = density;
        this.border = { top: 20000, bottom: 0, left: 20000, right: 0 };
        const HP = new Player(0, PlayerTypes.HUMAN);
        const P1 = new Player(1, PlayerTypes.AI);
        const P2 = new Player(2, PlayerTypes.AI);
        const P3 = new Player(3, PlayerTypes.AI);
        const P4 = new Player(4, PlayerTypes.AI);
        const P5 = new Player(5, PlayerTypes.AI);
        this.players = [HP, P1, P2, P3, P4, P5];
    }
    setSeed(seed: number) {
        this.seed = seed;
        this.rng = new Random(seed);
    }
    GenerateMap() {
        this.generateTiles();
        // do {
        //     createInitialKingdoms();
        // } while (!doesEveryPlayerHaveKingdom());
        // createTrees(gameState, vegetationDensity, random);
        // createCapitals(gameState);
        // sortPlayersByIncome(gameState);
        // createMoney(gameState);
    }
    tileFromColor(color: number) {
        const playerTileIndex = [2, 5, 3, 4, 1, 6];
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
        const tile = this.map.putTileAt(
            this.tileFromColor(color),
            offpos.x,
            offpos.y
        )!;
        this.tileList.push(tile);
        this.border = {
            left: Math.min(this.border.left, tile.pixelX),
            bottom: Math.max(this.border.bottom, tile.bottom),
            right: Math.max(this.border.right, tile.right),
            top: Math.min(this.border.top, tile.pixelY),
        };
    }
    generateTiles() {
        const tileAmountsToGenerate = new Map<Player, number>();
        const players = this.players.slice(); //this.players.slice().sort(() => Math.random() - 0.5); // Shuffle players
        for (let i = players.length - 1; i > 0; i--) {
            const j = this.rng.nextInt(i + 1);
            [players[i], players[j]] = [players[j], players[i]];
        }

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
        let nextTilePos = { x: 50, y: 25 }; // MapCenter
        const positionHistory: { x: number; y: number }[] = [];

        while (remainingPlayers.length > 0) {
            const currentTilePos = { ...nextTilePos };
            const playerIndex = Math.floor(
                this.rng.nextInt(remainingPlayers.length)
            );
            const player = remainingPlayers[playerIndex];
            this.placeTile(currentTilePos, player.color);
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
            const randomScore = this.rng.nextFloat() * scoreSum;
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

