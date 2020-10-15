/**
 * A class that wraps up our top down player logic. It creates, animates and moves a sprite in
 * response to WASD keys. Call its update method from the scene's update and call its destroy
 * method when you're done with the player.
 */
export default class Axe {
    constructor(scene, x, y) {
      this.scene = scene;
  
      const anims = scene.anims;
      anims.create({
        key: "swing-up",
        frames: anims.generateFrameNumbers("axe", { start: 0, end: 4 }),
        frameRate: 16,
        repeat: -1
      });
  
      this.sprite = scene.physics.add
        .sprite(x, y, "swing-up", 0)
        .setSize(16, 16)
        .setOffset(0, 0);
  
      this.sprite.anims.play("swing-up");
  
    }
  
    freeze() {
      this.sprite.body.moves = false;
    }
  
    update(x, y) {
      const sprite = this.sprite;
      this.sprite.x = x;
      this.sprite.y = y-16;
      sprite.anims.play("swing-up", true);

      // // Update the animation last and give left/right/down animations precedence over up animations
      // if (keys.left.isDown || keys.right.isDown || keys.down.isDown) {
      //   sprite.anims.play("player-walk", true);
      // } else if (keys.up.isDown) {
      //   sprite.anims.play("player-walk-back", true);
      // } else {
      //   sprite.anims.stop();
  
      //   // If we were moving & now we're not, then pick a single idle frame to use
      //   if (prevVelocity.y < 0) sprite.setTexture("characters", 0);
      //   else sprite.setTexture("characters", 0);
      // }
    }
  
    destroy() {
      this.sprite.destroy();
    }
  }
  