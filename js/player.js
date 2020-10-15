import Axe from "./axe.js";
import Bomb from "./bomb.js";

export default class Player {
    constructor(scene, x, y) {
      this.scene = scene;
  
      const anims = scene.anims;
      anims.create({
        key: "player-walk",
        frames: anims.generateFrameNumbers("characters", { start: 0, end: 7 }),
        frameRate: 16,
        repeat: -1
      });
      anims.create({
        key: "player-walk-back",
        frames: anims.generateFrameNumbers("characters", { start: 8, end: 16 }),
        frameRate: 16,
        repeat: -1
      });
  
      this.sprite = scene.physics.add
        .sprite(x, y, "characters", 0)
        .setSize(11, 14)
        .setOffset(3, 1);
  
      this.sprite.anims.play("player-walk-back");
  
      this.keys = scene.input.keyboard.createCursorKeys();

      this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

      
    }
  
    freeze() {
      this.sprite.body.moves = false;
    }
  
    update() {
      const keys = this.keys;
      const sprite = this.sprite;
      const speed = 100;
      const prevVelocity = sprite.body.velocity.clone();
  
      sprite.body.setVelocity(0);
  
      if (keys.left.isDown) {
        sprite.body.setVelocityX(-speed);
      } else if (keys.right.isDown) {
        sprite.body.setVelocityX(speed);
      }
  
      if (keys.up.isDown) {
        sprite.body.setVelocityY(-speed);
      } else if (keys.down.isDown) {
        sprite.body.setVelocityY(speed);
      }

      if(Phaser.Input.Keyboard.JustDown(this.keySpace)) {
        console.log("s") 
        new Bomb(this.scene, sprite.x , sprite.y - sprite.height);
      }
  
      sprite.body.velocity.normalize().scale(speed);
  
      if (keys.left.isDown || keys.right.isDown || keys.down.isDown) {
        sprite.anims.play("player-walk", true);
      } else if (keys.up.isDown) {
        sprite.anims.play("player-walk-back", true);
      } else {
        sprite.anims.stop();
  
        if (prevVelocity.y < 0) {
          sprite.setTexture("characters", 0);
        }
        else {
          sprite.setTexture("characters", 0);
        }
      }
    }
  
    destroy() {
      this.sprite.destroy();
    }
  }
  