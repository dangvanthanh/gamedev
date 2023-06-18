import Phaser from "phaser";
import { Arrow, Rainbow, Girl, Target, Terrain } from "../objects";
import { GameOptions, GameState } from "../constant";

export class GameScene extends Phaser.Scene {
  // current game state
  private gameState!: GameState;

  // the girl
  private girl!: Girl;

  // the terrain
  private terrain!: Terrain;

  // the rainbow
  private rainbow!: Rainbow;

  // the arrow
  private arrow!: Arrow;

  // the target
  private target!: Target;

  // array to hold all stuff to be scrolled
  private stuffToScroll!: any[];

  constructor() {
    super("GameScene");
  }

  init(): void {
    console.log("GameScene");
  }

  // method to be executed when the scene has been created
  create(): void {
    // at the beginning, the game is in idle state
    this.gameState = GameState.Idle;

    // add the terrain
    this.terrain = new Terrain(this);

    // add the target
    this.target = new Target(this);

    // add rainbow
    this.rainbow = new Rainbow(this);

    // add the arrow
    this.arrow = new Arrow(this);

    // add clouds, after the arrow for a matter of z-indexing
    this.rainbow.addClouds();

    // add the girl
    this.girl = new Girl(this);

    // tween the target to a random position
    this.tweenTarget(this.getRandomPosition());

    // populate the array with all stuff to be scrolled
    this.stuffToScroll = this.arrow.getChildren();
    this.stuffToScroll = this.stuffToScroll.concat(this.target.getChildren());
    this.stuffToScroll = this.stuffToScroll.concat(this.terrain.getChildren());

    // listeners
    this.input.on("pointerdown", this.handlePointer, this);
    this.rainbow.on("appeared", this.rainbowAppeared, this);
    this.arrow.on("flown", this.arrowFlown, this);
  }

  // method to handle pointer
  handlePointer(): void {
    // is the girl aiming?
    if (this.gameState == GameState.Aiming) {
      // now the girl is firing
      this.gameState = GameState.Firing;

      // default distance the arrow will travel
      let distance: number = (this.game.config.width as number) * 2;

      // if the arrow hits the target...
      if (
        this.target.hitByArrow(
          this.rainbow.center.x,
          this.rainbow.center.y,
          this.arrow.arrow.rotation
        )
      ) {
        // adjust the distance to make the arrow stop in the center of the target
        distance =
          (this.target.rings[0].x -
            this.rainbow.center.x -
            this.arrow.arrow.displayWidth) /
          Math.cos(this.arrow.arrow.rotation);

        // place the mask behind target horizontal center and make it big enough
        this.arrow.arrowMask.x = this.target.rings[0].x;
        this.arrow.arrowMask.y = this.target.rings[0].y;
      }

      // shoot the arrow!
      this.arrow.shoot(distance);
    }
  }

  // simple metod to get a random target position
  getRandomPosition(): number {
    return Math.round(
      Phaser.Math.FloatBetween(
        GameOptions.target.positionRange.from,
        GameOptions.target.positionRange.to
      ) * (this.game.config.width as number)
    );
  }

  // method to draw the rainbow
  drawRainbow(): void {
    this.rainbow.appear(
      this.girl.body.x,
      this.girl.body.getBounds().centerY,
      this.rainbow.clouds[1].x,
      this.rainbow.clouds[1].posY
    );
  }

  // method to be called once the rainbow appeared
  rainbowAppeared(): void {
    // the girl is aiming
    this.gameState = GameState.Aiming;

    // aim the arrow
    this.arrow.prepareToAim(this.rainbow);
  }

  // method to be called once the arrow flown
  arrowFlown(): void {
    // make rainbow disappear
    this.rainbow.disappear();

    // tween the new target
    this.tweenTarget(this.getRandomPosition());
  }

  // method to tween the target to posX
  // posX : the x position
  tweenTarget(posX: number): void {
    // delta X between current target position and destination position
    let deltaX: number = (this.game.config.width as number) * 2 - posX;

    // variable to save previous value
    let previousValue: number = 0;

    // variable to save the amount of pixels already travelled
    let totalTravelled: number = 0;

    // move rainbow cloud
    this.rainbow.moveCloud(
      this.girl.body.x - 50,
      this.girl.body.getBounds().top,
      deltaX * 3
    );

    // play girl's "run" animation
    this.girl.body.anims.play("run");

    // tween a number from 0 to 1
    this.tweens.addCounter({
      from: 0,
      to: 1,

      // tween duration according to deltaX
      duration: deltaX * 3,

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
        this.stuffToScroll.forEach((item: any) => {
          item.x -= delta * deltaX;
        });

        // adjust terrain position
        this.terrain.adjustPosition();

        // adjust target position
        this.target.adjustPosition(totalTravelled);
      },

      // method to be called when the tween completes
      onComplete: () => {
        // play girl's "idle" animation
        this.girl.body.anims.play("idle");

        // draw the rainbow
        this.drawRainbow();
      },
    });
  }

  // method to be executed at each frame
  // time : time passed since the beginning
  // deltaTime : time passed since last frame
  update(_time: number, deltaTime: number): void {
    // is the player aiming?
    if (this.gameState == GameState.Aiming) {
      // let the arrow aim
      this.arrow.aim(deltaTime, this.rainbow);
    }
  }
}
