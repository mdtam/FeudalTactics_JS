import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class Game extends Scene {
    controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setZoom(0.5);
        this.camera.centerOn(50, 50);

        this.add.text(400, 300, "hey what's up!!");

        const map = this.add.tilemap("map");
        const tileset = map.addTilesetImage("tileset", "tiles");
        map.createLayer("island", tileset);
        // const graphics = this.add.graphics({ x: 0, y: 0 });
        // map.renderDebugFull(graphics);

        const mapWidth = 5;
        const mapHeight = 5;

        for (let row = 0; row < mapHeight; row++) {
            for (let col = 0; col < mapWidth; col++) {
                map.putTileAt(Phaser.Math.RND.integerInRange(1, 13), col, row);
            }
        }
        console.log("JSON: MAP");
        console.log(map);

        const cursors = this.input.keyboard.createCursorKeys();
        const controlConfig = {
            camera: this.camera,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            zoomIn: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT
            ),
            zoomOut: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.NUMPAD_ADD
            ),
            zoomSpeed: 0.008,
            acceleration: 1,
            drag: 0.05,
            maxSpeed: 0.5,
        };

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(
            controlConfig
        );

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }

    update(_time: unknown, delta: number) {
        this.controls.update(delta);
        this.controls.maxSpeedX = this.controls.maxSpeedX / this.camera.zoom;
        this.controls.maxSpeedY = this.controls.maxSpeedY / this.camera.zoom;
    }
}

