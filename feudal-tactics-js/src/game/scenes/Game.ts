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
        this.camera.setBackgroundColor(0x00ff00);
        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        // const map = this.add.tilemap("map");
        // const tileset = map.addTilesetImage("tileset", "tiles")!;

        // map.createLayer("Calque 1", tileset);

        // const cursors = this.input.keyboard.createCursorKeys();
        // const controlConfig = {
        //     camera: this.cameras.main,
        //     left: cursors.left,
        //     right: cursors.right,
        //     up: cursors.up,
        //     down: cursors.down,
        //     acceleration: 0.02,
        //     drag: 0.0005,
        //     maxSpeed: 0.7,
        // };

        // this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(
        //     controlConfig
        // );

        // this.cameras.main.setZoom(2);
        // this.cameras.main.centerOn(200, 100);

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }

    // update(_time: unknown, delta: number) {
    //     this.controls.update(delta);
    // }
}

