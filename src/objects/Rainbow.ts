import Phaser from "phaser";
import { GameOptions } from "../constant";
import { Cloud } from "./Cloud";

// rainbow ends
enum RainbowEnd {
  Lower,
  Upper,
}

export class Rainbow extends Phaser.GameObjects.Group {
  // the Graphics ojbect representing the rainbow itself
  public graphics!: Phaser.GameObjects.Graphics;

  // rainbow start angle
  public startAngle!: number;

  // rainbow radius
  public radius!: number;

  // rainbow length, in radians
  public length!: number;

  // rainbow center
  public center!: Phaser.Geom.Point;

  // array where to store the clouds
  public clouds!: Cloud[];

  constructor(scene: Phaser.Scene) {
    super(scene);
    scene.add.existing(this);

    // add a new graphics
    this.graphics = this.scene.add.graphics();

    // add the graphics to the group
    this.add(this.graphics);
  }

  // method to add the clouds
  addClouds(): void {
    // populate clouds array
    this.clouds = [new Cloud(this.scene), new Cloud(this.scene)];
    this.add(this.clouds[RainbowEnd.Lower]);
    this.add(this.clouds[RainbowEnd.Upper]);
  }

  // method to make the rainbow appear
  // centerX : x coordinate of rainbow center
  // centerY : y coordinate of rainbow center
  // arcX : x coordinate of the beginning of the arc
  // arcY : y coordinate of the beginning of the arc
  appear(centerX: number, centerY: number, arcX: number, arcY: number): void {
    // make lower cloud visible
    this.clouds[RainbowEnd.Lower].setVisible(true);

    // set rainbow center
    this.center = new Phaser.Geom.Point(centerX, centerY);

    // make a line representing rainbow radius
    let rainbowRadius: Phaser.Geom.Line = new Phaser.Geom.Line(
      centerX,
      centerY,
      arcX,
      arcY
    );

    // get radius length
    this.radius =
      Phaser.Geom.Line.Length(rainbowRadius) -
      (GameOptions.rainbow.colors.length / 2) * GameOptions.rainbow.width;

    // get radius angle, which is rainbow start angle
    this.startAngle = Phaser.Geom.Line.Angle(rainbowRadius);

    // get a random rainbow arc length
    this.length = (Math.PI / 4) * 3 + Phaser.Math.FloatBetween(0, Math.PI / 4);

    // generic tween of a value from 0 to 1, to make rainbow appear
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,

      // tween duration
      duration: 200,

      // tween callback scope
      callbackScope: this,

      // method to be called at each tween update
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        // draw the rainbow
        this.drawRainbow(this.length * tween.getValue());
      },

      // method to be called when the tween completes
      onComplete: () => {
        // emit "appeared" event
        this.emit("appeared");
      },
    });
  }

  // method to make the rainbow disappear
  disappear(): void {
    // generic tween of a value from 0 to 1, to make rainbow disappear
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,

      // tween duration
      duration: 200,

      // tween callback scope
      callbackScope: this,

      // function to be called at each tween update
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        // draw the rainbow
        this.drawRainbow(this.length - this.length * tween.getValue());
      },

      // function to be called when the tween ends
      onComplete: () => {
        // make lower cloud disappear
        this.clouds[RainbowEnd.Lower].setVisible(false);
      },
    });
  }

  // method to draw the rainbow
  // angle : rainbow angle
  drawRainbow(angle: number): void {
    // clear rainbow graphics
    this.graphics.clear();

    // loop through all rainbow colors
    GameOptions.rainbow.colors.forEach((item: number, index: number) => {
      // set line style
      this.graphics.lineStyle(GameOptions.rainbow.width, item, 1);

      // draw the arc
      this.graphics.beginPath();
      this.graphics.arc(
        this.center.x,
        this.center.y,
        this.radius + index * GameOptions.rainbow.width,
        this.startAngle,
        this.startAngle + angle,
        false
      );
      this.graphics.strokePath();

      // set lower cloud posY attribute
      this.clouds[RainbowEnd.Lower].posY =
        this.center.y +
        (this.radius + (index * GameOptions.rainbow.width) / 2) *
          Math.sin(this.startAngle + angle);

      // set lower cloud x position
      this.clouds[RainbowEnd.Lower].setX(
        this.center.x +
          (this.radius + (index * GameOptions.rainbow.width) / 2) *
            Math.cos(this.startAngle + angle)
      );
    });
  }

  // method to move the cloud
  // startX : cloud x position
  // startY : cloud y position
  // duration : movement duration, in milliseconds.
  moveCloud(startX: number, startY: number, duration: number): void {
    // next cloud X position
    let nextCloudX: number = startX + Phaser.Math.Between(0, 100);

    // next cloud y position
    let nextCloudY: number = startY - Phaser.Math.Between(50, 100);

    // move the cloud along the path
    this.clouds[RainbowEnd.Upper].moveAlongPath(
      nextCloudX,
      nextCloudY,
      duration
    );
  }
}
