import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { GameMap } from "../utils/GameMap";

export class Game extends Scene {
    controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    camera: Phaser.Cameras.Scene2D.Camera;
    gameMap: GameMap;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;
        const map = this.add.tilemap("map");
        const tileset = map.addTilesetImage("tileset", "tiles");
        map.createLayer("island", tileset!);

        this.gameMap = new GameMap(map, 1715300692539, 50, -3);
        // this.gameMap = new GameMap(map, 42, 50, -3);
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

        // const graf = this.add.graphics({ x: 0, y: 0 });
        // map.renderDebugFull(graf);
        this.gameMap.tileList.forEach((tile, order) => {
            this.add.text(tile.pixelX, tile.pixelY, order.toString(), {
                color: "red",
                fontSize: 22,
            });
        });
        this.scaleAndCenter();
        EventBus.emit("current-scene-ready", this);
    }

    scaleAndCenter() {
        const { bottom, left, right, top } = this.gameMap.border;
        // Calculate map width and height
        const mapWidth = right - left;
        const mapHeight = bottom - top;
        // Calculate center of the map
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        // Calculate desired camera view width and height with margin
        const margin = 50; // Adjust the margin as needed
        const desiredWidth = mapWidth + 2 * margin;
        const desiredHeight = mapHeight + 2 * margin;
        // Calculate zoom level needed to fit the entire map within the camera view
        const zoomX = this.camera.width / desiredWidth;
        const zoomY = this.camera.height / desiredHeight;
        const zoom = Math.min(zoomX, zoomY);
        // Set camera position to the center of the map
        this.camera.centerOn(centerX, centerY);
        // Set camera zoom level
        this.camera.setZoom(zoom);
    }

    changeScene() {
        this.scene.start("MainMenu");
    }

    update(_time: unknown, delta: number) {
        this.controls.update(delta);
        this.controls.zoomSpeed = (this.camera.zoom * 0.008) / 0.19;
        this.controls.maxSpeedX = 1 / this.camera.zoom;
        this.controls.maxSpeedY = 1 / this.camera.zoom;
        this.controls.accelX = 1.5 / this.camera.zoom;
        this.controls.accelY = 1.5 / this.camera.zoom;
        this.controls.dragX = 0.07 / this.camera.zoom;
        this.controls.dragY = 0.07 / this.camera.zoom;
    }
}

