import Phaser from "phaser";
import { ImageNames } from "../constant/ImageNames";

export class Bootstrap extends Phaser.Scene {
  constructor() {
    super("Bootstrap");
  }

  init(): void {}

  preload(): void {
    this.load.image(ImageNames.Circle, "/assets/sprites/circle.png");
    this.load.image(ImageNames.GrassTile, "/assets/sprites/grasstile.png");
    this.load.image(ImageNames.DirtTile, "/assets/sprites/dirttile.png");
    this.load.image(ImageNames.Pole, "/assets/sprites/pole.png");
    this.load.image(ImageNames.PoleTop, "/assets/sprites/poletop.png");
    this.load.image(ImageNames.Cloud, "/assets/sprites/cloud.png");
    this.load.image(ImageNames.Arrow, "/assets/sprites/arrow.png");
    // girl
    this.load.spritesheet(ImageNames.IdleGirl, "/assets/sprites/idlegirl.png", {
      frameWidth: 119,
      frameHeight: 130,
    });
    this.load.spritesheet(
      ImageNames.RunningGirl,
      "/assets/sprites/runninggirl.png",
      {
        frameWidth: 119,
        frameHeight: 130,
      }
    );
  }

  create(): void {
    // define idle animation
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("idlegirl", {
        start: 0,
        end: 15,
      }),
      frameRate: 15,
      repeat: -1,
    });

    // define running animation
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("runninggirl", {
        start: 0,
        end: 19,
      }),
      frameRate: 15,
      repeat: -1,
    });

    this.createNewGame();
  }

  update(): void {}

  private createNewGame() {
    console.log("Bootstrap game");
    this.scene.launch("GameScene");
  }
}
