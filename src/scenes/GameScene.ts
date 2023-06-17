import Phaser from "phaser";
import { ImageNames } from "../constant/ImageNames";

const GameOptions = {
  // terrain start, in screen height ratio, where 0 = top, 1 = bottom
  terrainStart: 0.6,

  // girl x position, in screen widt radio, where 0 = left, 1 = right
  girlPosition: 0.15,

  // target position range, in screen width ratio, where 0 = left, 1 = tight
  targetPositionRange: {
    from: 0.5,
    to: 0.9,
  },

  // target height range, in pixels
  targetHeightRange: {
    from: 150,
    to: 350,
  },

  // number of rings
  rings: 5,

  // ring ratio, to make target look oval, this is the ratio of width compared to height
  ringRatio: 0.8,

  // ring colors, from external to internal
  ringColor: [0xffffff, 0x5cb6f8, 0xe34d46, 0xf2aa3c, 0x95a53c],

  // ring radii, from external to internal, in pixels
  ringRadius: [45, 35, 35, 25, 15],

  // tolerance of ring radius, can be up to this ratio bigger or smaller
  ringRadiusTolerance: 0.5,

  // rainbow colors
  rainbowColors: [
    0xe8512e, 0xfbb904, 0xffef02, 0x65b33b, 0x00aae5, 0x3c4395, 0x6c4795,
  ],

  // rainbow rings width, in pixels
  rainbowWidth: 5,

  // arrow rotation speed, in degrees per second
  arrowSpeed: 180,
};

export class GameScene extends Phaser.Scene {
  private terrain!: Phaser.GameObjects.TileSprite;

  // dirt below the terrain
  private dirt!: Phaser.GameObjects.TileSprite;

  // pole
  private pole!: Phaser.GameObjects.TileSprite;

  // topmost part of the pole
  private poleTop!: Phaser.GameObjects.Sprite;

  // pole shadow
  private poleShadow!: Phaser.GameObjects.Sprite;

  // target shadow
  private targetShadow!: Phaser.GameObjects.Sprite;

  // target rigns
  private targetRings!: Phaser.GameObjects.Sprite[];

  // girl
  private girl!: Phaser.GameObjects.Sprite;

  // rainbow
  private rainbow!: Phaser.GameObjects.Graphics;

  // clouds
  private clouds!: Phaser.GameObjects.Sprite[];

  // arrow
  private arrow!: Phaser.GameObjects.Sprite;

  constructor() {
    super("GameScene");
  }

  init(): void {
    console.log("GameScene");
  }

  create(): void {
    // define idle animation
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNames(ImageNames.IdleGirl, {
        start: 0,
        end: 15,
      }),
      frameRate: 15,
      repeat: -1,
    });

    // define running animation
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNames(ImageNames.RunningGirl, {
        start: 0,
        end: 19,
      }),
      frameRate: 15,
      repeat: -1,
    });

    // add terrain
    let terrainStartY: number =
      (this.game.config.height as number) * GameOptions.terrainStart;
    this.terrain = this.add.tileSprite(
      0,
      terrainStartY,
      (this.game.config.width as number) + 256,
      256,
      ImageNames.GrassTile
    );
    this.terrain.setOrigin(0, 0);

    // add dirt, the graphics below the terrain
    let dirtStartY: number = terrainStartY + 256;
    this.dirt = this.add.tileSprite(
      0,
      dirtStartY,
      this.terrain.width,
      (this.game.config.height as number) - dirtStartY,
      ImageNames.DirtTile
    );
    this.dirt.setOrigin(0, 0);

    // add a circle which represents target shadow
    this.targetShadow = this.add.sprite(0, 0, ImageNames.Circle);
    this.targetShadow.setTint(0x676767);

    // add pole shadow
    let poleYPos: number = terrainStartY + 38;
    this.poleShadow = this.add.sprite(0, poleYPos, ImageNames.Circle);
    this.poleShadow.setTint(0x000000);
    this.poleShadow.setAlpha(0.2);
    this.poleShadow.setDisplaySize(90, 20);

    // add pole
    this.pole = this.add.tileSprite(0, poleYPos, 32, 0, ImageNames.Pole);
    this.pole.setOrigin(0.5, 1);

    // add pole top
    this.poleTop = this.add.sprite(0, 0, ImageNames.PoleTop);
    this.poleTop.setOrigin(0.5, 1);

    // add circles which represent the various target circles
    this.targetRings = [];
    for (let i: number = 0; i < GameOptions.rings; i++) {
      this.targetRings[i] = this.add.sprite(0, 0, ImageNames.Circle);
    }

    // girl start position
    let girlXPos: number =
      (this.game.config.width as number) * GameOptions.girlPosition;

    // add girl shadow
    let girlShadow: Phaser.GameObjects.Sprite = this.add.sprite(
      girlXPos + 5,
      poleYPos,
      ImageNames.Circle
    );
    girlShadow.setTint(0x000000);
    girlShadow.setAlpha(0.2);
    girlShadow.setDisplaySize(60, 20);

    // add girl
    this.girl = this.add.sprite(girlXPos, poleYPos, ImageNames.Girl);
    this.girl.setOrigin(0.5, 1);
    this.girl.anims.play("idle");

    // add rainbow
    this.rainbow = this.add.graphics();

    // add the arrow
    this.arrow = this.add.sprite(0, 0, ImageNames.Arrow);
    this.arrow.setVisible(false);
    this.arrow.setOrigin(0, 0.5);

    // add clouds
    this.clouds = [
      this.add.sprite(0, 0, ImageNames.Cloud),
      this.add.sprite(0, 0, ImageNames.Cloud),
    ];

    // set a custom property to top cloud
    this.clouds[1].setData("posY", this.girl.getBounds().top - 50);

    // add a tween to move a bit clouds up and down
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 1000,
      callbackScope: this,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        this.clouds[1].y =
          this.clouds[1].getData("posY") +
          5 * Math.cos(Math.PI * tween.getValue());
        this.clouds[0].y =
          this.clouds[0].getData("posY") +
          5 * Math.cos(Math.PI * tween.getValue());
      },
      yoyo: true,
      repeat: -1,
    });

    // place a random target at current position
    this.placeTarget((this.game.config.width as number) * 2, this.pole.y);

    // tween the target to a random position
    this.tweenTarget(this.getRandomPosition());
  }

  update(_time: number, deltatime: number): void {
    // is the arrow visible?
    if (this.arrow.visible == true) {
      // rotate the arrow according to arrow speed
      this.arrow.angle +=
        ((GameOptions.arrowSpeed * deltatime) / 1000) *
        this.arrow.getData("mult");

      // did the arrow reach the end of the rainbow?
      if (this.arrow.angle > this.arrow.getData("end")) {
        // don't let it go further
        this.arrow.angle = this.arrow.getData("end");

        // invert arrow rotation direction
        this.arrow.setData("mult", this.arrow.getData("mult") * -1);
      }

      // did the arrow reach the beginning of the rainbow?
      if (this.arrow.angle < this.arrow.getData("start")) {
        // don't let the arrow go further
        this.arrow.angle = this.arrow.getData("start");

        // invert arrow rotation direction
        this.arrow.setData("mult", this.arrow.getData("mult") * -1);
      }

      // set arrow position according to its rotation
      this.arrow.setPosition(
        this.girl.x +
          this.arrow.getData("radius") * Math.cos(this.arrow.rotation),
        this.girl.getBounds().centerY +
          this.arrow.getData("radius") * Math.sin(this.arrow.rotation)
      );
    }
  }

  getRandomPosition(): number {
    return Math.round(
      Phaser.Math.FloatBetween(
        GameOptions.targetPositionRange.from,
        GameOptions.targetPositionRange.to
      ) * (this.game.config.width as number)
    );
  }

  // method to draw the rainbow
  drawRainbow(): void {
    // make a line representing rainbow radius
    let rainbowRadius: Phaser.Geom.Line = new Phaser.Geom.Line(
      this.girl.x,
      this.girl.getBounds().centerY,
      this.clouds[1].x,
      this.clouds[1].getData("posY")
    );

    // get radius length
    let rainbowRadiusLength: number =
      Phaser.Geom.Line.Length(rainbowRadius) -
      (GameOptions.rainbowColors.length / 2) * GameOptions.rainbowWidth;

    // get radius angle, which is random start angle
    let rainbowStartAngle: number = Phaser.Geom.Line.Angle(rainbowRadius);

    // get a random rainbow arc length
    let rainbowLength: number =
      (Math.PI / 4) * 3 + Phaser.Math.FloatBetween(0, Math.PI / 4);

    // hide the lower cloud
    this.clouds[0].setVisible(true);

    // generic tween of a value from 0 to 1, to make rainbow appear
    this.tweens.addCounter({
      from: 0,
      to: 1,

      // tween duration according to deltaX
      duration: 200,

      // tween callback scope
      callbackScope: this,

      // method to be called at each tween update
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        // get current angle according to rainbow length and tween value
        let angle: number = rainbowLength * tween.getValue();

        // clear rainbow graphics
        this.rainbow.clear();

        // loop through all rainbow colors
        GameOptions.rainbowColors.forEach((item: number, index: number) => {
          // set line style
          this.rainbow.lineStyle(GameOptions.rainbowWidth, item, 1);

          // draw the arc
          this.rainbow.beginPath();
          this.rainbow.arc(
            this.girl.x,
            this.girl.getBounds().centerY,
            rainbowRadiusLength + index * GameOptions.rainbowWidth,
            rainbowStartAngle,
            rainbowStartAngle + angle,
            false
          );
          this.rainbow.strokePath();
        });

        // set posY property of lower cloud
        this.clouds[0].setData(
          "posY",
          this.girl.getBounds().centerY +
            rainbowRadiusLength * Math.sin(rainbowStartAngle + angle) +
            (GameOptions.rainbowColors.length / 2) * GameOptions.rainbowWidth
        );

        // set x position of lower cloud
        this.clouds[0].setX(
          this.girl.x +
            rainbowRadiusLength * Math.cos(rainbowStartAngle + angle)
        );
      },

      // method to be called when the tween completes
      onComplete: () => {
        // show the arrow
        this.arrow.setVisible(true);

        // place the arrow according to rainbow radius
        this.arrow.setPosition(
          this.girl.x + rainbowRadiusLength - 30,
          this.girl.getBounds().centerY
        );

        // set some arrow data
        this.arrow.setData("radius", rainbowRadiusLength - 30);
        this.arrow.setData("start", Phaser.Math.RadToDeg(rainbowStartAngle));
        this.arrow.setData(
          "end",
          Phaser.Math.RadToDeg(rainbowStartAngle + rainbowLength)
        );
        this.arrow.setData("mult", 1);

        // rotate the arrow according to rainbow radius
        this.arrow.setAngle(Phaser.Math.RadToDeg(rainbowStartAngle));

        // add a time event
        this.time.addEvent({
          // wait 1 second
          delay: 2000,

          // tween callback scope
          callbackScope: this,

          // callback function
          callback: () => {
            // generic tween of a value from 0 to 1, to make rainbow appear
            this.tweens.addCounter({
              from: 0,
              to: 1,

              // tween duration according to deltaX
              duration: 200,

              // tween callback scope
              callbackScope: this,

              // method to be called at each tween update
              onUpdate: (tween: Phaser.Tweens.Tween) => {
                // get current angle according to rainbow length and tween value
                let angle: number =
                  rainbowLength - rainbowLength * tween.getValue();

                // clear rainbow graphics
                this.rainbow.clear();

                // loop through all rainbow colors
                GameOptions.rainbowColors.forEach(
                  (item: number, index: number) => {
                    // set line style
                    this.rainbow.lineStyle(GameOptions.rainbowWidth, item, 1);

                    // draw the arc
                    this.rainbow.beginPath();
                    this.rainbow.arc(
                      this.girl.x,
                      this.girl.getBounds().centerY,
                      rainbowRadiusLength + index * GameOptions.rainbowWidth,
                      rainbowStartAngle,
                      rainbowStartAngle + angle,
                      false
                    );
                    this.rainbow.strokePath();
                  }
                );

                // set posY property of lower cloud
                this.clouds[0].setData(
                  "posY",
                  this.girl.getBounds().centerY +
                    rainbowRadiusLength * Math.sin(rainbowStartAngle + angle) +
                    (GameOptions.rainbowColors.length / 2) *
                      GameOptions.rainbowWidth
                );

                // set x position of lower cloud
                this.clouds[0].setX(
                  this.girl.x +
                    rainbowRadiusLength * Math.cos(rainbowStartAngle + angle)
                );
              },
              onComplete: () => {
                this.clouds[0].setVisible(false);
              },
            });

            // tween the new target
            this.tweenTarget(this.getRandomPosition());
          },
        });
      },
    });
  }

  // method to place the target at (posX, posY)
  placeTarget(posX: number, posY: number): void {
    // array where to store radii values
    let ringRadii: number[] = [];

    // determine radii values according to default radius size and tolerance
    for (let i: number = 0; i < GameOptions.rings; i++) {
      ringRadii[i] = Math.round(
        GameOptions.ringRadius[i] +
          GameOptions.ringRadius[i] *
            Phaser.Math.FloatBetween(0, GameOptions.ringRadiusTolerance) *
            Phaser.Math.RND.sign()
      );
    }

    // get the sum of all radii, this will be the size of the target
    let radiiSum: number = ringRadii.reduce((sum, value) => sum + value, 0);

    // determine target height
    let targetHeight: number =
      posY -
      Phaser.Math.Between(
        GameOptions.targetHeightRange.from,
        GameOptions.targetHeightRange.to
      );

    // set pole shadow x poisition
    this.poleShadow.setX(posX);

    // set pole x position
    this.pole.setX(posX);

    // set pole height
    this.pole.height = posY - targetHeight;

    // set pole top position
    this.poleTop.setPosition(
      posX,
      this.pole.y - this.pole.displayHeight - radiiSum / 2 + 10
    );

    // set shadow size
    this.targetShadow.setDisplaySize(
      radiiSum * GameOptions.ringRatio,
      radiiSum
    );

    // set target shadow position
    this.targetShadow.setPosition(posX + 5, targetHeight);

    // loop through all rings
    for (let i: number = 0; i < GameOptions.rings; i++) {
      // set ring position
      this.targetRings[i].setPosition(posX, targetHeight);

      // set ring tint
      this.targetRings[i].setTint(GameOptions.ringColor[i]);

      // set ring diplay size
      this.targetRings[i].setDisplaySize(
        radiiSum * GameOptions.ringRatio,
        radiiSum
      );

      // decrease radiiSum to get the radius of next ring
      radiiSum -= ringRadii[i];
    }
  }

  // method to tween the target to posX
  tweenTarget(posX: number): void {
    // array with all target related stuff to move
    let stuffToMove: any[] = [
      this.pole,
      this.poleTop,
      this.poleShadow,
      this.targetShadow,
      this.terrain,
      this.dirt,
    ].concat(this.targetRings);

    // delta X between current target position and destination position
    let deltaX: number = (this.game.config.width as number) * 2 - posX;

    // variable to save previous value
    let previousValue: number = 0;

    // variable to save the amount of pixels already travelled
    let totalTravelled: number = 0;

    // next cloud X position
    let nextCloudX: number = this.girl.x - 50 + Phaser.Math.Between(0, 100);

    // next cloud y position
    let nextCloudY: number =
      this.girl.getBounds().top - Phaser.Math.Between(50, 100);

    // object which will follow a path
    let follower: any = {
      t: 0,
      vec: new Phaser.Math.Vector2(),
    };

    // define cloud movement line
    let movementLine: Phaser.Curves.Line = new Phaser.Curves.Line([
      this.clouds[1].x,
      this.clouds[1].getData("posY"),
      nextCloudX,
      nextCloudY,
    ]);

    // add a path
    var path: Phaser.Curves.Path = this.add.path(0, 0);

    // add movement line to path
    path.add(movementLine);

    // move the cloud along the path
    this.tweens.add({
      targets: follower,
      t: 1,
      ease: "Linear",
      duration: deltaX * 3,
      callbackScope: this,
      onUpdate: () => {
        var point = path.getPoint(follower.t, follower.vec);
        this.clouds[1].setX(point.x);
        this.clouds[1].setData("posY", point.y);
      },
    });

    // play girl's "run" animation
    this.girl.anims.play("run");

    // tween a number from 0 to 1
    this.tweens.addCounter({
      from: 0,
      to: 1,

      // tween duration according to deltaX
      duration: deltaX * 3,

      // tween easing
      ease: Phaser.Math.Easing.Cubic.InOut,

      // tween callback scope
      callbackScope: this,

      // method to be called at each tween update
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        // delta between previous and current value
        let delta: number = tween.getValue() - previousValue;

        // update previous value to current value
        previousValue = tween.getValue();

        // determine the amount of pixels travelled
        totalTravelled += delta * deltaX;

        // move all stuff
        stuffToMove.forEach((item: any) => {
          item.x -= delta * deltaX;
        });

        // adjust the seamless terrain when it goes too much outside the screen
        if (this.terrain.x < -256) {
          this.terrain.x += 256;
        }

        // adjust the seamless dirt when it goes too much outside the screen
        if (this.dirt.x < -256) {
          this.dirt.x += 256;
        }

        // if the target left the canvas from the left side...
        if (this.targetShadow.getBounds().right < 0) {
          // reposition it on the right side
          this.placeTarget(
            (this.game.config.width as number) * 2 - totalTravelled,
            this.pole.y
          );
        }
      },

      // method to be called when the tween completes
      onComplete: () => {
        // play girl's idle animation
        this.girl.anims.play("idle");

        // draw the rainbow
        this.drawRainbow();
      },
    });
  }
}
