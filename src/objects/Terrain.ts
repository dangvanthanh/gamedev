import Phaser from "phaser";
import { GameOptions } from "../constant";

export class Terrain extends Phaser.GameObjects.Group {
  // the grass, the upper part of the terrain
  public grass!: Phaser.GameObjects.TileSprite;

  // the dirt, the lower part of the terrain
  public dirt!: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene) {
    super(scene);
    scene.add.existing(this);

    // determine terrain starting y position
    let terrainStartY: number =
      (this.scene.game.config.height as number) * GameOptions.terrain.start;

    // add grass tilesprite
    this.grass = this.scene.add.tileSprite(
      0,
      terrainStartY,
      (this.scene.game.config.width as number) + 256,
      256,
      "grasstile"
    );
    this.grass.setOrigin(0, 0);

    // add the grass to group
    this.add(this.grass);

    // determine dirt starting y position
    let dirtStartY: number = terrainStartY + 256;

    // add dirt tilesprite
    this.dirt = this.scene.add.tileSprite(
      0,
      dirtStartY,
      this.grass.width,
      (this.scene.game.config.height as number) - dirtStartY,
      "dirttile"
    );
    this.dirt.setOrigin(0, 0);

    // add the dirt to the group
    this.add(this.dirt);
  }

  // method to adjust terrain position
  adjustPosition(): void {
    // adjust the seamless grass when it goes too much outside the screen
    if (this.grass.x < -256) {
      this.grass.x += 256;
    }

    // adjust the seamless dirt when it goes too much outside the screen
    if (this.dirt.x < -256) {
      this.dirt.x += 256;
    }
  }
}
