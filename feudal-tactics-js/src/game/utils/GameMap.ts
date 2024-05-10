import { Player, PlayerTypes } from "./Player";
import { Random } from "./Random";
import { HexTile } from "./HexTile";

export class GameMap {
    readonly map: Phaser.Tilemaps.Tilemap;
    tileList: HexTile[] = [];
    readonly seed: number;
    readonly landMass: number;
    readonly density: number;
    readonly players: Player[];
    readonly rng: Random;
    border = { top: 20000, bottom: 0, left: 20000, right: 0 };

    constructor(
        map: Phaser.Tilemaps.Tilemap,
        seed = 42,
        landMass = 42,
        density = 0,
        players?: Player[]
    ) {
        this.map = map;
        this.seed = seed;
        this.rng = new Random(seed);
        this.landMass = landMass;
        this.density = density;
        const HP = new Player(0, PlayerTypes.HUMAN);
        const P1 = new Player(1, PlayerTypes.AI);
        const P2 = new Player(2, PlayerTypes.AI);
        const P3 = new Player(3, PlayerTypes.AI);
        const P4 = new Player(4, PlayerTypes.AI);
        const P5 = new Player(5, PlayerTypes.AI);
        this.players = players ?? [HP, P1, P2, P3, P4, P5];
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

    generateTiles() {
        // Clean up
        this.map.fill(-1, 0, 0, 100, 100, false);
        this.tileList = [];
        this.border = { top: 20000, bottom: 0, left: 20000, right: 0 };

        // Shuffle Players
        const players = this.players.slice();
        for (let i = players.length - 1; i > 0; i--) {
            const j = this.rng.nextInt(i + 1);
            [players[i], players[j]] = [players[j], players[i]];
        }

        // Divide Land Mass
        const tileAmountsToGenerate = new Map<Player, number>();
        let remainingLandMass = this.landMass % players.length;
        players.forEach((player) => {
            const additionalTiles = remainingLandMass > 0 ? 1 : 0;
            tileAmountsToGenerate.set(
                player,
                Math.floor(this.landMass / players.length) + additionalTiles
            );
            if (remainingLandMass > 0) remainingLandMass--;
        });

        // Generate The Tiles
        const remainingPlayers = players.slice();
        let nextTilePos = HexTile.fromOffset({ row: 50, col: 50 }); // Map Center
        const positionHistory: HexTile[] = [];
        while (remainingPlayers.length > 0) {
            // Choose Player
            const playerIndex = Math.floor(
                this.rng.nextInt(remainingPlayers.length)
            );
            const player = remainingPlayers[playerIndex];
            if (tileAmountsToGenerate.get(player) === 1) {
                remainingPlayers.splice(playerIndex, 1);
            } else {
                tileAmountsToGenerate.set(
                    player,
                    tileAmountsToGenerate.get(player)! - 1
                );
            }

            // Put Tile -- (assignment for immutability)
            let currentTilePos = nextTilePos.place(this.map, player);
            this.tileList.push(currentTilePos);
            positionHistory.push(currentTilePos);
            this.border = {
                left: Math.min(this.border.left, currentTilePos.left),
                bottom: Math.max(this.border.bottom, currentTilePos.bottom),
                right: Math.max(this.border.right, currentTilePos.right),
                top: Math.min(this.border.top, currentTilePos.top),
            };

            // Get Neighbors and Select Next Tile
            let usableCoords = this.getUnusedNeighborCoords(currentTilePos);
            while (usableCoords.length === 0) {
                currentTilePos = positionHistory.pop()!;
                usableCoords = this.getUnusedNeighborCoords(currentTilePos);
            }
            const scores = usableCoords.map((candidate) =>
                Math.pow(
                    this.getUnusedNeighborCoords(new HexTile(candidate)).length,
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
            nextTilePos = new HexTile(usableCoords[index]);
        }
    }

    getUnusedNeighborCoords = (tile: HexTile): { q: number; r: number }[] =>
        tile
            // Get Neighbors
            .getNeighborCoords()
            // Within Map Boundaries
            .filter(({ q, r }) => {
                const { col, row } = new HexTile({ q, r }).getOffset();
                return col > 0 && col < 100 && row > 0 && row < 100;
            })
            // Filter Unused
            .filter(
                ({ q, r }) => !this.tileList.some((t) => t.q == q && t.r == r)
            );
}

