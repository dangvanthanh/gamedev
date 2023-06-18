import Phaser, { GameObjects } from "phaser";
import { GameOptions } from "../constant";
import { Rainbow } from "./Rainbow";

export class Arrow extends Phaser.GameObjects.Group {
  // a simple multiplier to make the arrow move clockwise or counter clockwise
  public mult!: number;

  // the arrow itself

  public arrow!: Phaser.GameObjects.Sprite;

  // arrow mask to simulate the arrow to stick in the target
  public arrowMask!: GameObjects.Sprite;

  constructor(scene: Phaser.Scene) {
    super(scene);
    scene.add.existing(this);

    // add the arrow
    this.arrow = scene.add.sprite(0, 0, "arrow");
    this.arrow.setOrigin(0, 0.5);
    this.arrow.setVisible(false);
    this.mult = 1;

    // add arrow to the group
    this.add(this.arrow);

    // create a mask to simulate arrow sticking in the target
    this.arrowMask = scene.add.sprite(0, 0, "mask");
    this.arrowMask.setOrigin(0, 0.5);
    this.arrowMask.setVisible(false);
    this.arrowMask.setDisplaySize(512, 512);

    // add arrow mask to the group
    this.add(this.arrowMask);

    // set the mask as a bitmap mask
    let bitmapMask: Phaser.Display.Masks.BitmapMask =
      this.arrowMask.createBitmapMask();
    bitmapMask.invertAlpha = true;
    this.arrow.setMask(bitmapMask);
  }

  // method to prepare to aim
  // rainbow : the rainbow
  prepareToAim(rainbow: Rainbow) {
    // place the arrow mask outside the screen
    this.arrowMask.setX(this.scene.game.config.width as number);

    // set the arrow visible
    this.arrow.setVisible(true);

    // place the arrow according to rainbow radius
    this.arrow.setPosition(
      rainbow.center.x + rainbow.radius - 30,
      rainbow.center.y
    );

    // rotate the arrow according to rainbow radius
    this.arrow.setAngle(Phaser.Math.RadToDeg(rainbow.startAngle));
  }

  // method to aim
  // deltaTime : time passed since previous frame, in milliseconds
  // rainbow : the raimbow
  aim(deltaTime: number, rainbow: Rainbow): void {
    // rotate the arrow according to arrow speed
    this.arrow.angle +=
      ((GameOptions.arrow.rotationSpeed * deltaTime) / 1000) * this.mult;

    // did the arrow reach the end of the rainbow?
    if (
      this.arrow.angle >
      Phaser.Math.RadToDeg(rainbow.startAngle + rainbow.length)
    ) {
      // don't let it go further
      this.arrow.angle = Phaser.Math.RadToDeg(
        rainbow.startAngle + rainbow.length
      );

      // invert arrow rotation direction
      this.mult *= -1;
    }

    // did the arrow reach the beginning of the rainbow?
    if (this.arrow.angle < Phaser.Math.RadToDeg(rainbow.startAngle)) {
      // don't let the arrow go further
      this.arrow.angle = Phaser.Math.RadToDeg(rainbow.startAngle);

      // invert arrow rotation direction
      this.mult *= -1;
    }

    // set arrow position according to its rotation
    this.arrow.setPosition(
      rainbow.center.x + (rainbow.radius - 30) * Math.cos(this.arrow.rotation),
      rainbow.center.y + (rainbow.radius - 30) * Math.sin(this.arrow.rotation)
    );
  }

  // method to shoot
  // distance : distance the arrow must travel
  shoot(distance: number): void {
    // add the tween to shoot the arrow
    this.scene.tweens.add({
      // target: the arrow
      targets: this.arrow,

      // arrow destination, determine with trigonometry
      x: this.arrow.x + distance * Math.cos(this.arrow.rotation),
      y: this.arrow.y + distance * Math.sin(this.arrow.rotation),

      // tween duration, according to distance
      duration: (distance / GameOptions.arrow.flyingSpeed) * 1000,

      // tween callback scope
      callbackScope: this,

      // function to execute when the tween is complete
      onComplete: () => {
        // add a timer event to wait one second
        this.scene.time.addEvent({
          // amount of milliseconds to wait
          delay: 1000,

          // timer callback scope
          callbackScope: this,

          // function to execute when the timer is complete
          callback: () => {
            // emit "flown" event
            this.emit("flown");
          },
        });
      },
    });
  }
}
