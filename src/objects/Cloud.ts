import Phaser from "phaser";

export class Cloud extends Phaser.GameObjects.Sprite {
  // we need to keep track of y position to allow floating movement
  public posY!: number;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "cloud");
    scene.add.existing(this);

    // add a tween from 0 to 1
    this.scene.tweens.addCounter({
      // start value
      from: 0,

      // end value
      to: 1,

      // tween duration, in milliseconds
      duration: 1000,

      // callback scope
      callbackScope: this,

      // function to be executed at each update
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        // make cloud float using a cosine function
        this.setY(this.posY + 5 * Math.cos(Math.PI * tween.getValue()));
      },

      // run the tween in reverse as well
      yoyo: true,

      // execute the tween forever
      repeat: -1,
    });
  }

  // method to move a cloud along a path
  // posX : new x position
  // posY : new y position
  // duration : duration, in milliseconds, of the movement
  moveAlongPath(posX: number, posY: number, duration: number): void {
    // object which will follow a path
    let follower: any = {
      t: 0,
      vec: new Phaser.Math.Vector2(),
    };

    // define cloud movement line
    let movementLine: Phaser.Curves.Line = new Phaser.Curves.Line([
      this.x,
      this.posY,
      posX,
      posY,
    ]);

    // add a path
    var path: Phaser.Curves.Path = this.scene.add.path(0, 0);

    // add movement line to path
    path.add(movementLine);

    // add a tween
    this.scene.tweens.add({
      // tween target
      targets: follower,

      // bring t property of the target to 1
      t: 1,

      // duration, in milliseconds
      duration: duration,

      // callback scope
      callbackScope: this,

      // function to be executed at each update
      onUpdate: () => {
        // get the point along the path at time t, where 0 = the beginning, 1 = the end
        var point = path.getPoint(follower.t, follower.vec);

        // set new cloud x position
        this.setX(point.x);

        // set new cloud Y property
        this.posY = point.y;
      },
    });
  }
}
