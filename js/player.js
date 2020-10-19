import Axe from "./axe.js";
import Bomb from "./bomb.js";

export default class Player {
    constructor(scene, x, y) {
      this.scene = scene;

      this.inventory = {
        iron: 0,
        red: 0,
        yellow: 0,
        blue: 0,
        diamond: 0,
        bomb: 0,
      }
  
      const anims = scene.anims;
      anims.create({
        key: "player-walk",
        frames: anims.generateFrameNumbers("characters", { start: 0, end: 7 }),
        frameRate: 16,
        repeat: -1
      });
      anims.create({
        key: "player-walk-back",
        frames: anims.generateFrameNumbers("characters", { start: 8, end: 15 }),
        frameRate: 16,
        repeat: -1
      });
      anims.create({
        key: "player-walk-right",
        frames: anims.generateFrameNumbers("characters", { start: 16, end: 23 }),
        frameRate: 16,
        repeat: -1
      });
  
      this.sprite = scene.physics.add
        .sprite(x, y, "characters", 0)
        .setSize(7, 7)
        .setOffset(5, 8);
  
      this.sprite.anims.play("player-walk-back");
  
      this.keys = scene.input.keyboard.createCursorKeys();

      this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

      
    }
  
    freeze() {
      this.sprite.body.moves = false;
    }

    pickUpGem(type, amount) {
      
      this.inventory[type] += amount;
      console.log( `${this.inventory[type]} ${type}`)
      document.getElementById(type).innerText = `${this.inventory[type]} ${type}`
    }
  
    update() {
      const keys = this.keys;
      const sprite = this.sprite;
      const speed = 100;
      const prevVelocity = sprite.body.velocity.clone();
  
      sprite.body.setVelocity(0);
  
      if (keys.left.isDown) {
        sprite.setFlipX(true);
        sprite.body.setVelocityX(-speed);
      } else if (keys.right.isDown) {
        sprite.setFlipX(false);
        sprite.body.setVelocityX(speed);
      }
  
      if (keys.up.isDown) {
        sprite.body.setVelocityY(-speed);
      } else if (keys.down.isDown) {
        sprite.body.setVelocityY(speed);
      }

      if(Phaser.Input.Keyboard.JustDown(this.keySpace)) {
        if(this.inventory.bomb > 0) {
          new Bomb(this.scene, sprite.x , sprite.y - sprite.height);
          this.inventory.bomb--;
        }
        
      }
  
      sprite.body.velocity.normalize().scale(speed);
  
      if (keys.down.isDown) {
        sprite.anims.play("player-walk", true);
      } else if (keys.up.isDown) {
        sprite.anims.play("player-walk-back", true);
      } else if(keys.left.isDown || keys.right.isDown) {
        sprite.anims.play("player-walk-right", true);
      }
      else {
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
  