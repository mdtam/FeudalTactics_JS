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
        this.camera.setZoom(2);
        this.camera.centerOn(200, 100);
        // this.camera.setBackgroundColor(0x00ff00);
        // this.background = this.add.image(512, 384, "background");
        // this.background.setAlpha(0.5);

        this.add.text(400, 300, "hey what's up!!");

        const map = this.add.tilemap("map");
        const tileset = map.addTilesetImage("tileset", "tiles")!;

        map.createLayer("Calque 1", tileset);

        const cursors = this.input.keyboard!.createCursorKeys(); // asserted
        const controlConfig = {
            camera: this.camera,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            acceleration: 0.7,
            drag: 0.005,
            maxSpeed: 0.7,
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
    }
}

