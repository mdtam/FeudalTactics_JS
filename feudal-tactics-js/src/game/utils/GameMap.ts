import { HexTile } from "./HexTile";
import { Kingdom } from "./Kingdom";
import { Capital, Tree } from "./MapObjects";
import { Player, PlayerTypes } from "./Player";
import { Random } from "./Random";

export class GameMap {
    readonly map: Phaser.Tilemaps.Tilemap;
    tiles: Array<Array<HexTile>> = [];
    orderedTiles: Array<HexTile> = [];
    readonly seed: number;
    readonly landMass: number;
    readonly density: number;
    readonly players: Player[];
    readonly rng: Random;
    kingdoms: Kingdom[] = [];
    border = { top: 20000, bottom: 0, left: 20000, right: 0 };

    constructor(
        map: Phaser.Tilemaps.Tilemap,
        seed = 42,
        landMass = 42,
        density = 0,
        players?: Player[]
    ) {
        if (seed === 0) {
            seed = Date.now();
        }

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
        do {
            this.generateTiles();
            this.createInitialKingdoms();
        } while (!this.doesEveryPlayerHaveKingdom());
        this.createTrees(0.1);
        this.createCapitals();
        this.sortPlayersByIncome();
        // createMoney(gameState);

        // NEXT: fix the game state, setup architecture.
        //       Create Game Controller. EVENT BUS??
        //       PALM trees. CONQUERING tiles and etc
    }

    createTrees(vegitationDensity: number) {
        for (const tile of this.orderedTiles) {
            if (this.rng.nextFloat() <= vegitationDensity) {
                tile.setContents(this.map, Tree);
            }
        }
    }

    doesEveryPlayerHaveKingdom() {
        const playersWithoutKingdoms = this.players.filter(
            (p) => !this.kingdoms.some((k) => k.getPlayer() === p)
        );
        return !playersWithoutKingdoms.length;
    }

    createInitialKingdoms() {
        this.kingdoms = [];
        this.orderedTiles.forEach((tile) => {
            for (const neighborTile of this.getNeighborTiles(tile)) {
                if (!neighborTile || neighborTile.player !== tile.player) {
                    // water or tile of a different player
                    continue;
                }
                // two neighboring tiles belong to the same player
                if (!tile.kingdom && !neighborTile.kingdom) {
                    // none of the tiles already belong to a kingdom --> create a new one
                    const newKingdom = new Kingdom(tile.player);
                    this.kingdoms.push(newKingdom);
                    newKingdom.getTiles().push(tile, neighborTile);
                    tile.setKingdom(newKingdom);
                    neighborTile.setKingdom(newKingdom);
                } else if (tile.getKingdom() && !neighborTile.getKingdom()) {
                    // tile belongs to a kingdom but neighbor does not -> add neighbor to existing kingdom
                    tile.getKingdom().getTiles().push(neighborTile);
                    neighborTile.setKingdom(tile.getKingdom());
                } else if (!tile.getKingdom() && neighborTile.getKingdom()) {
                    // neighbor belongs to a kingdom but tile does not -> add tile to existing kingdom
                    neighborTile.getKingdom().getTiles().push(tile);
                    tile.setKingdom(neighborTile.getKingdom());
                } else if (
                    tile.getKingdom() &&
                    neighborTile.getKingdom() &&
                    tile.getKingdom() !== neighborTile.getKingdom()
                ) {
                    // tile and neighbor belong to different kingdoms --> merge kingdoms
                    this.kingdoms.splice(
                        this.kingdoms.findIndex(
                            (k) => k === neighborTile.getKingdom()
                        ),
                        1
                    );
                    for (const neighborKingdomTile of neighborTile
                        .getKingdom()
                        .getTiles()) {
                        neighborKingdomTile.setKingdom(tile.getKingdom());
                        tile.getKingdom().getTiles().push(neighborKingdomTile);
                    }
                }
            }
        });
    }

    generateTiles() {
        // Clean up
        this.map.fill(-1, 0, 0, 100, 100, false);
        this.tiles = new Array<Array<HexTile>>(1000);
        this.orderedTiles = [];
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
            if (!this.tiles[currentTilePos.q]) {
                this.tiles[currentTilePos.q] = new Array<HexTile>(1000);
            }
            this.tiles[currentTilePos.q][currentTilePos.r] = currentTilePos;
            this.orderedTiles.push(currentTilePos);
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

    createCapitals() {
        for (const kingdom of this.kingdoms) {
            this.createCapital(kingdom);
        }
    }

    createCapital(kingdom: Kingdom) {
        // First, we try to find the first empty tile to use it as a capital. Otherwise, we pick any tile.
        const tile =
            kingdom.getTiles().find((t) => !t.contents) ||
            kingdom.getTiles()[0];
        if (!tile) {
            throw new Error("Kingdom with zero tiles!");
        }
        tile.setContents(this.map, Capital);
    }

    sortPlayersByIncome() {
        this.players.sort((a,b)=>{
            const incomeA = this.kingdoms.filter(k=>k.getPlayer()==a).reduce((s,k)=> s+k.income, 0);
            const incomeB = this.kingdoms.filter(k=>k.getPlayer()==b).reduce((s,k)=> s+k.income, 0);

            return incomeA - incomeB;
        })
    }

    // HEX
    getNeighborTiles = (tile: HexTile): (HexTile | null)[] =>
        tile
            .getNeighborCoords()
            .map(({ q, r }) =>
                this.tiles[q] && this.tiles[q][r] ? this.tiles[q][r] : null
            );
    getUnusedNeighborCoords = (tile: HexTile): { q: number; r: number }[] =>
        tile
            .getNeighborCoords() // Filter Unused
            .filter(({ q, r }) => !(this.tiles[q] && this.tiles[q][r]));
}

