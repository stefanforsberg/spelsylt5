import Phaser from "phaser";

import Level from "./level.js"


/**
 * Scene that generates a new dungeon
 */
export default class MineScene extends Phaser.Scene {
  constructor() {
    
    super({
      key: "MineScene",
    });
  }

  preload() {
   

    

  }

  create(gameSettings) {
    console.log("creating")
    this.gameSettings = gameSettings;

    this.level = new Level().create(this);

    this.levelEnded = false;

    this.previousTime = -1;

    this.cameras.main.setZoom(3);

    this.timer = this.time.addEvent({
      delay: this.gameSettings.inventory.oxygen*1000,
      callback: this.endLevel,
      callbackScope: this,
      loop: false
    });
   
  }

  endLevel(success) {
    
    if(this.levelEnded) {
      return;
    }

    const mainScene = this.scene.get("MainScene");
    mainScene.gameSettings.inventory.bomb = this.level.player.inventory.bomb

    this.levelEnded = true;

    this.level.player.freeze();
    const cam = this.cameras.main;
    cam.fade(250, 0, 0, 0);
    cam.once("camerafadeoutcomplete", () => {

      if(!success) {
        this.gameSettings.ui.death.style.display = 'flex';
        this.gameSettings.ui.mine.style.display = 'none';
      } else {
        this.gameSettings.ui.success.style.display = 'flex';
        this.gameSettings.ui.mine.style.display = 'none';
      }

      this.input.keyboard.on('keydown', () => {
        this.scene.stop();
        this.scene.resume("MainScene");
      })
     
    });
    
    console.log("end level")
  }

  update(time, delta) {
    this.level.update();

    const currentTime = Math.floor(this.timer.getElapsedSeconds());

    if(currentTime > this.previousTime) {
      this.previousTime = currentTime;
      const timeLeft = this.gameSettings.inventory.oxygen - currentTime;
      this.gameSettings.ui.oxygen.innerHTML = `O<sub>2</sub>: ${timeLeft} sec`

      if(timeLeft === (this.gameSettings.inventory.oxygen / 2)) {
        this.tweens.add({
          targets: this.cameras.main,
          zoom: { value: 2, duration: 2000 },
          yoyo: false,
          loop: 0,
        });
      }

    }
  }
}
