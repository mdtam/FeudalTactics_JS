import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { GameMap } from '../lib/GameMap';

export class Game extends Scene {
  controls: Phaser.Cameras.Controls.SmoothedKeyControl;
  camera: Phaser.Cameras.Scene2D.Camera;
  gameMap: GameMap;
  background: Phaser.GameObjects.TileSprite;

  constructor() {
    super('Game');
  }

  create() {
    this.camera = this.cameras.main;
    const map = this.add.tilemap('map');
    this.background = this.add.tileSprite(
      map.widthInPixels / 2,
      map.heightInPixels / 2,
      map.widthInPixels * 2,
      map.heightInPixels * 2,
      'water'
    );
    const tileset = map.addTilesetImage('tileset', 'tiles');
    map.createLayer('island', tileset!);

    // this.gameMap = new GameMap(map, 1715300692539, 50, -3);
    this.gameMap = new GameMap(map, 0, 150, -3);
    this.gameMap.GenerateMap();

    const cursors = this.input.keyboard!.createCursorKeys();
    const controlConfig: Phaser.Types.Cameras.Controls.SmoothedKeyControlConfig = {
      camera: this.camera,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      zoomIn: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT),
      zoomOut: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ADD),
      zoomSpeed: 0.008,
      minZoom: 0.19,
      maxZoom: 2,
      acceleration: 1.5,
      drag: 0.07,
      maxSpeed: 0.5,
    };

    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

    // const graf = this.add.graphics({ x: 0, y: 0 });
    // map.renderDebugFull(graf);
    // this.gameMap.kingdoms.forEach((kingdom, id) => {
    //   kingdom.getTiles().forEach((tile) => {
    //     this.add.text(tile.left, tile.top, id.toString(), {
    //       color: 'red',
    //       fontSize: 22,
    //     });
    //   });
    // });
    // this.gameMap.orderedTiles.forEach((tile, idx) => {
    //   this.add.text(tile.left, tile.top, idx.toString(), {
    //     color: 'red',
    //     fontSize: 22,
    //   });
    // });

    this.scaleAndCenter();
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, _gameObjects: unknown, _deltaX: number, deltaY: number) => {
      const worldPointBefore = this.camera.getWorldPoint(pointer.x, pointer.y);
      if (deltaY > 0) {
        const newZoom = this.camera.zoom - 0.1;
        if (newZoom > 0.19) {
          this.camera.zoom = newZoom;
        }
      }
      if (deltaY < 0) {
        const newZoom = this.camera.zoom + 0.1;
        if (newZoom < 2) {
          this.camera.zoom = newZoom;
        }
      }
      this.camera.preRender();
      const worldPointAfter = this.camera.getWorldPoint(pointer.x, pointer.y);
      this.camera.scrollX += worldPointBefore.x - worldPointAfter.x;
      this.camera.scrollY += worldPointBefore.y - worldPointAfter.y;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;

      this.camera.scrollX -= (pointer.x - pointer.prevPosition.x) / this.camera.zoom;
      this.camera.scrollY -= (pointer.y - pointer.prevPosition.y) / this.camera.zoom;
    });

    EventBus.emit('current-scene-ready', this);
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
    this.camera.setBounds(
      -this.gameMap.map.widthInPixels / 3,
      -this.gameMap.map.heightInPixels / 3,
      (this.gameMap.map.widthInPixels * 5) / 3,
      (this.gameMap.map.heightInPixels * 5) / 3
    );
  }

  changeScene() {
    this.scene.start('MainMenu');
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
    this.background.tilePositionX += 0.05;
  }
}
