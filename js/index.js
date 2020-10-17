import Phaser from "phaser";
import MainScene from "./mainScene.js";
import MineScene from "./mineScene.js";


const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000",
  parent: "game",
  pixelArt: true,
  scene: [MainScene, MineScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);