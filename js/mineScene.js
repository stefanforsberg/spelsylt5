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
    console.log("coming");
    this.load.image("tiles", "../img/minetileset-extruded.png");
    this.load.image("smoke", "../img/smoke.png");
    this.load.spritesheet("characters", "../img/gubbe2.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });

    this.load.spritesheet("bomb", "../img/bomb.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });

    this.load.spritesheet("axe", "../img/yxa.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });

  }

  create(gameSettings) {
    console.log("creating")
    this.gameSettings = gameSettings;

    this.level = new Level().create(this);

    this.previousTime = 0;

    this.cameras.main.setZoom(3);

    this.timer = this.time.addEvent({
      delay: this.gameSettings.oxygenTimer*1000,
      callback: this.endLevel,
      callbackScope: this,
      loop: false
    });
   
  }

  endLevel() {

    this.level.player.freeze();
    const cam = this.cameras.main;
    cam.fade(250, 0, 0, 0);
    cam.once("camerafadeoutcomplete", () => {
      this.gameSettings.ui.death.style.display = 'flex';
      this.gameSettings.ui.mine.style.display = 'none';

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
      document.getElementById("oxygen").innerText = `Oxygen: ${(this.gameSettings.oxygenTimer - currentTime)} sec`
    }
  }
}
