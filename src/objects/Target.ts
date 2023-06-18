import Phaser from "phaser";
import { GameOptions } from "../constant";

export class Target extends Phaser.GameObjects.Group {
  // target shadow
  public shadow!: Phaser.GameObjects.Sprite;

  // pole shadow
  public poleShadow!: Phaser.GameObjects.Sprite;

  // the pole
  public pole!: Phaser.GameObjects.TileSprite;

  // pole top
  public poleTop!: Phaser.GameObjects.Sprite;

  // array with all rings
  public rings!: Phaser.GameObjects.Sprite[];

  // array with all rings radii
  public ringRadii!: number[];

  constructor(scene: Phaser.Scene) {
    super(scene);
    scene.add.existing(this);

    // x position where to start placing stuff
    let stuffStartX: number =
      (this.scene.game.config.height as number) * GameOptions.terrain.start +
      GameOptions.terrain.stuffOffset;

    // add a circle which represents target shadow
    this.shadow = this.scene.add.sprite(0, 0, "circle");
    this.shadow.setTint(0x676767);

    // add the shadow to the group
    this.add(this.shadow);

    // add a circle representing pole shadow
    this.poleShadow = this.scene.add.sprite(0, stuffStartX, "circle");
    this.poleShadow.setTint(0x000000);
    this.poleShadow.setAlpha(0.2);
    this.poleShadow.setDisplaySize(90, 20);

    // add pole shadow to the group
    this.add(this.poleShadow);

    // add pole
    this.pole = this.scene.add.tileSprite(0, stuffStartX, 32, 0, "pole");
    this.pole.setOrigin(0.5, 1);

    // add the pole to the group
    this.add(this.pole);

    // add pole top
    this.poleTop = this.scene.add.sprite(0, 0, "poletop");
    this.poleTop.setOrigin(0.5, 1);

    // add pole top to the group
    this.add(this.poleTop);

    // add circles which represent the various target circles
    this.rings = [];
    for (let i: number = 0; i < GameOptions.targetRings.amount; i++) {
      this.rings[i] = this.scene.add.sprite(0, 0, "circle");
      this.add(this.rings[i]);
    }

    // place the target
    this.place((this.scene.game.config.width as number) * 2);
  }

  // method to place the garget
  // posX : x position
  place(posX: number): void {
    // array where to store radii values
    this.ringRadii = [];

    // determine radii values according to default radius size and tolerance
    for (let i: number = 0; i < GameOptions.targetRings.amount; i++) {
      this.ringRadii[i] = Math.round(
        GameOptions.targetRings.radius[i] +
          GameOptions.targetRings.radius[i] *
            Phaser.Math.FloatBetween(
              0,
              GameOptions.targetRings.radiusTolerance
            ) *
            Phaser.Math.RND.sign()
      );
    }

    // get the sum of all radii, this will be the size of the target
    let radiiSum: number = this.ringRadii.reduce(
      (sum, value) => sum + value,
      0
    );

    // determine target height
    let targetHeight: number =
      this.pole.y -
      Phaser.Math.Between(
        GameOptions.target.heightRange.from,
        GameOptions.target.heightRange.to
      );

    // set pole shadow x poisition
    this.poleShadow.setX(posX);

    // set pole x position
    this.pole.setX(posX);

    // set pole height
    this.pole.height = this.pole.y - targetHeight;

    // set pole top position
    this.poleTop.setPosition(
      posX,
      this.pole.y - this.pole.displayHeight - radiiSum / 2 + 10
    );

    // set shadow size
    this.shadow.setDisplaySize(
      radiiSum * GameOptions.targetRings.ratio,
      radiiSum
    );

    // set target shadow position
    this.shadow.setPosition(posX + 5, targetHeight);

    // loop through all rings
    for (let i: number = 0; i < GameOptions.targetRings.amount; i++) {
      // set ring position
      this.rings[i].setPosition(posX, targetHeight);

      // set ring tint
      this.rings[i].setTint(GameOptions.targetRings.color[i]);

      // set ring diplay size
      this.rings[i].setDisplaySize(
        radiiSum * GameOptions.targetRings.ratio,
        radiiSum
      );

      // decrease radiiSum to get the radius of next ring
      radiiSum -= this.ringRadii[i];
    }
  }

  // method to check if the target has been hit by the arrow
  // startX : x position of rainbow center
  // startY : y position of rainbow center
  // arrowAngle : arrow angle
  hitByArrow(startX: number, startY: number, arrowAngle: number): boolean {
    // get radii sum, which is the height of the target
    let radiiSum: number = this.ringRadii.reduce(
      (sum, value) => sum + value,
      0
    );

    // we define a target line going from the center of the rainbow to the top edge of the target
    let topTargetLine: Phaser.Geom.Line = new Phaser.Geom.Line(
      startX,
      startY,
      this.rings[0].x,
      this.rings[0].y - radiiSum / 2
    );

    // we define a target line going from the center of the rainbow to the bottom edge of the target
    let bottomTargetLine: Phaser.Geom.Line = new Phaser.Geom.Line(
      startX,
      startY,
      this.rings[0].x,
      this.rings[0].y + radiiSum / 2
    );

    // get the angle of the top target line and normalize it
    let topAngle: number = Phaser.Geom.Line.Angle(topTargetLine);
    let topNormalizedAngle: number = Phaser.Math.Angle.Normalize(topAngle);

    // get the angle of the bottom target line and normalize it
    let bottomAngle: number = Phaser.Geom.Line.Angle(bottomTargetLine);
    let bottomNormalizedAngle: number =
      Phaser.Math.Angle.Normalize(bottomAngle);

    // get the normalized arrow angle
    let arrowNormalizedAngle: number = Phaser.Math.Angle.Normalize(arrowAngle);

    // return true if arrow angle is between top and bottom target angle
    return (
      arrowNormalizedAngle >= topNormalizedAngle &&
      arrowNormalizedAngle <= bottomNormalizedAngle
    );
  }

  // adjust target position
  // deltaX : distance alreay travelled by the target
  adjustPosition(deltaX: number): void {
    // if the target left the canvas from the left side...
    if (this.shadow.getBounds().right < 0) {
      // reposition it on the right side
      this.place((this.scene.game.config.width as number) * 2 - deltaX);
    }
  }
}
