import Phaser from "phaser";
import { GameOptions } from "../constant";

export class Girl extends Phaser.GameObjects.Group {
  // the girl itself
  public body!: Phaser.GameObjects.Sprite;

  // girl shadow
  public shadow!: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene) {
    super(scene);
    scene.add.existing(this);

    // determine girl x and y position
    let girlPositionY: number =
      (this.scene.game.config.height as number) * GameOptions.terrain.start +
      GameOptions.terrain.stuffOffset;
    let girlPositionX: number =
      (this.scene.game.config.width as number) * GameOptions.girlPosition;

    // add girl shadow
    this.shadow = this.scene.add.sprite(
      girlPositionX + 5,
      girlPositionY,
      "circle"
    );
    this.shadow.setTint(0x000000);
    this.shadow.setAlpha(0.2);
    this.shadow.setDisplaySize(60, 20);

    // add shadow to group
    this.add(this.shadow);

    // add girl
    this.body = this.scene.add.sprite(girlPositionX, girlPositionY, "girl");
    this.body.setOrigin(0.5, 1);
    this.body.anims.play("idle");

    // add girl to group
    this.add(this.body);
  }
}
