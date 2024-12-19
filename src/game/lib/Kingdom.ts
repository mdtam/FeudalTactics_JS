import { HexTile } from './HexTile';
import { PalmTree, Tree } from './MapObjects';
import { Player } from './Player';

/** Group of connected tiles that belong to the same player. **/
export class Kingdom {
  private tiles: HexTile[] = [];
  private player: Player;
  private savings: number = 0;
  private doneMoving: boolean = false;
  private wasActiveInCurrentTurn: boolean = false;

  constructor(player: Player) {
    this.player = player;
  }

  getTiles(): HexTile[] {
    return this.tiles;
  }

  setTiles(tiles: HexTile[]): void {
    this.tiles = tiles;
  }

  getPlayer(): Player {
    return this.player;
  }

  setPlayer(player: Player): void {
    this.player = player;
  }

  getSavings(): number {
    return this.savings;
  }

  setSavings(savings: number): void {
    this.savings = savings;
  }

  isDoneMoving(): boolean {
    return this.doneMoving;
  }

  setDoneMoving(doneMoving: boolean): void {
    this.doneMoving = doneMoving;
  }

  isWasActiveInCurrentTurn(): boolean {
    return this.wasActiveInCurrentTurn;
  }

  setWasActiveInCurrentTurn(wasActiveInCurrentTurn: boolean): void {
    this.wasActiveInCurrentTurn = wasActiveInCurrentTurn;
  }

  get income() {
    // You get 1 unit of income per tile. Excluding any tiles with trees:
    return this.getTiles().filter(
      (t) => t.contents !== Tree && t.contents !== PalmTree
    ).length;
  }

  equals(obj: Kingdom): boolean {
    if (this === obj) {
      return true;
    }
    if (obj == null || this.constructor !== obj.constructor) {
      return false;
    }
    const other: Kingdom = obj as Kingdom;
    return (
      this.doneMoving === other.doneMoving &&
      this.player.equals(other.player) &&
      this.savings === other.savings &&
      this.tiles.length === other.tiles.length &&
      this.tiles.every((tile, index) => tile.equals(other.tiles[index])) &&
      this.wasActiveInCurrentTurn === other.wasActiveInCurrentTurn
    );
  }

  toString(): string {
    return `Kingdom [tiles=${this.tiles.map((tile) => tile.pos())}, player=${
      this.player
    }, savings=${this.savings}, doneMoving=${
      this.doneMoving
    }, wasActiveInCurrentTurn=${this.wasActiveInCurrentTurn}]`;
  }
}
