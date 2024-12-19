import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    menuContainer: GameObjects.Container;

    constructor() {
        super("MainMenu");
    }

    create() {
        this.logo = this.add.image(0, 0, "logo").setOrigin(0.5, 0.5);
        this.title = this.add
            .text(0, 200, "Main Menu", {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        this.menuContainer = this.add.container(
            this.scale.width / 2,
            this.scale.height / 2,
            [this.logo, this.title]
        );
        this.menuContainer.setSize(this.logo.width, this.logo.height * 2);
        this.setupCamera();
        this.scale.on("resize", this.setupCamera, this);
        EventBus.emit("current-scene-ready", this);
    }

    setupCamera() {
        // Get the current width and height of the game canvas
        const { width, height } = this.scale;
        // Center the container
        this.menuContainer.setPosition(width / 2, height / 2);
        // Calculate the appropriate scale to fit within the viewport
        const scale =
            Math.min(
                width / this.menuContainer.width,
                height / this.menuContainer.height
            ) * 0.7;
        this.menuContainer.setScale(scale);
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start("Game");
    }

    moveLogo(vueCallback: ({ x, y }: { x: number; y: number }) => void) {
        if (this.logoTween) {
            if (this.logoTween.isPlaying()) {
                this.logoTween.pause();
            } else {
                this.logoTween.play();
            }
        } else {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 525, duration: 3000, ease: "Back.easeInOut" },
                y: { value: 80, duration: 1500, ease: "Sine.easeOut" },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (vueCallback) {
                        vueCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y),
                        });
                    }
                },
            });
        }
    }
}

