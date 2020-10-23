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
        cloudberry: 0,
        bomb: this.scene.gameSettings.inventory.bomb,
        speed: this.scene.gameSettings.inventory.speed,
        oxygen: this.scene.gameSettings.inventory.oxygen,
        diamonddrill: this.scene.gameSettings.inventory.diamonddrill
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

      this.updateInventoryUI();
      
    }
  
    freeze() {
      this.sprite.body.moves = false;
    }

    pickUpGem(type, amount) {
      this.scene.sound.play("item", {volume: 0.3})
      this.inventory[type] += amount;
    }

    updateInventoryUI() {
      this.scene.gameSettings.ui.bomb.innerHTML = `Bomb ${this.inventory.bomb}`
    }
  
    update() {

      
      const keys = this.keys;
      const sprite = this.sprite;
      const speed = this.inventory.speed;
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

          
          let baseX = sprite.x;
          let baseY = sprite.y;

          if(sprite.body.facing === Phaser.Physics.Arcade.FACING_UP) {
            baseY -= 16
          } else if(sprite.body.facing === Phaser.Physics.Arcade.FACING_DOWN) {
            baseY += 16
          } else if(sprite.body.facing === Phaser.Physics.Arcade.FACING_LEFT) {
            baseX -= 16
          } else if(sprite.body.facing === Phaser.Physics.Arcade.FACING_RIGHT) {
            baseX += 16
          } else {
          }

          new Bomb(this.scene, baseX , baseY);
          this.inventory.bomb--;

          this.updateInventoryUI();
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
          sprite.setTexture("characters", 8);
        }
        else if (prevVelocity.y > 0) {
          sprite.setTexture("characters", 0);
        } else if (prevVelocity.x !== 0) {
          sprite.setTexture("characters", 16);
        }
      }
    }
  
    destroy() {
      this.sprite.destroy();
    }
  }
  