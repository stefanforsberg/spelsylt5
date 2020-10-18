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

  create() {
    this.level = new Level().create(this);



    this.cameras.main.setZoom(3);

    
  }

  update(time, delta) {
    this.level.update();
  }
}
