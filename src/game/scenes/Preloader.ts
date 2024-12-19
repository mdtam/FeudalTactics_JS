import { Scene } from "phaser";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(400, 300, "background");

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(400, 300, 300, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(400 - 230, 300, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on("progress", (progress: number) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + 300 * progress;
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.image("logo", "assets/logo.png");
        this.load.image("star", "assets/star.png");
        this.load.image("tiles", "assets/tileset.png");
        this.load.tilemapTiledJSON("map", "assets/hexagonal.json");
        this.load.image("tree", "sprites/tree.png");
        this.load.image("capital", "sprites/capital.png");
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.
        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start("MainMenu");
    }
}

