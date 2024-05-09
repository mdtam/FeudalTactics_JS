import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { GameMap } from "../utils/MapHelper";

export class Game extends Scene {
    controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    gameMap: GameMap;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setZoom(0.5);
        this.camera.centerOn(50 * 64, 50 * 55);

        const map = this.add.tilemap("map");
        const tileset = map.addTilesetImage("tileset", "tiles");
        map.createLayer("island", tileset!);

        this.gameMap = new GameMap(map);
        this.gameMap.GenerateMap();

        const cursors = this.input.keyboard!.createCursorKeys();
        const controlConfig: Phaser.Types.Cameras.Controls.SmoothedKeyControlConfig =
            {
                camera: this.camera,
                left: cursors.left,
                right: cursors.right,
                up: cursors.up,
                down: cursors.down,
                zoomIn: this.input.keyboard!.addKey(
                    Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT
                ),
                zoomOut: this.input.keyboard!.addKey(
                    Phaser.Input.Keyboard.KeyCodes.NUMPAD_ADD
                ),
                zoomSpeed: 0.008,
                minZoom: 0.19,
                maxZoom: 2,
                acceleration: 1.5,
                drag: 0.07,
                maxSpeed: 0.5,
            };

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(
            controlConfig
        );

        const graf = this.add.graphics({ x: 0, y: 0 });
        map.renderDebugFull(graf);
        this.gameMap
            .getNeighborCoords(
                this.gameMap.offset_to_axial({
                    x: this.gameMap.tileList[0].x,
                    y: this.gameMap.tileList[0].y,
                })
            )
            .forEach((tile, index) => {
                const t = map.getTileAt(
                    this.gameMap.axial_to_offset(tile).x,
                    this.gameMap.axial_to_offset(tile).y,
                    true
                )!;
                this.add.text(t.pixelX, t.pixelY, index.toString(), {
                    color: "black",
                    fontSize: 22,
                });
            });

        this.gameMap.tileList.forEach((tile, order) => {
            this.add.text(tile.pixelX, tile.pixelY, order.toString(), {
                color: "red",
                fontSize: 22,
            });
        });
        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }

    update(_time: unknown, delta: number) {
        this.controls.update(delta);
        this.controls.zoomSpeed = (this.camera.zoom * 0.008) / 0.19;
        this.controls.maxSpeedX = 1 / this.camera.zoom;
        this.controls.maxSpeedY = 1 / this.camera.zoom;
    }
}

