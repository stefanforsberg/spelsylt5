/**
 * A class that wraps up our top down player logic. It creates, animates and moves a sprite in
 * response to WASD keys. Call its update method from the scene's update and call its destroy
 * method when you're done with the player.
 */
export default class Bomb {
    constructor(scene, x, y) {
      this.scene = scene;
  
      const anims = scene.anims;
      anims.create({
        key: "bombfuse",
        frames: anims.generateFrameNumbers("bomb", { start: 0, end: 3 }),
        frameRate: 16,
        repeat: -1
      });
  
      this.sprite = scene.physics.add
        .sprite(x, y, "bomb", 0)
        .setSize(16, 16)
        .setOffset(0, 0);
  
      this.sprite.anims.play("bombfuse");

      scene.time.addEvent({
        delay: 2000,
        callback: () => {this.destroy()},
        callbackScope: this,
        loop: false
      });
  
    }
    
    destroy() {
      this.scene.level.explodingBomb({x: this.sprite.x, y: this.sprite.y});

      this.scene.cameras.main.shake(300, 0.0005);

      const emitter = this.scene.add.particles('smoke').createEmitter({
        x: this.sprite.x,
        y: this.sprite.y,
        speed: 10,
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 3 },
        alpha: { start: 0.4, end: 0 },
        blendMode: 'NORMAL',
        lifespan: 400,
        gravityY:  0
      });

      this.sprite.destroy();

      this.scene.time.addEvent({
        delay: 300,
        callback: () => {emitter.stop();},
        callbackScope: this,
        loop: false
      });
    }
  }
  