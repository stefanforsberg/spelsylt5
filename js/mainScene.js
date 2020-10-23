import Phaser from "phaser";
import GroundMp3 from "../dist/audio/ground.mp3"
import WindMp3 from "../dist/audio/wind.mp3";
import MineMp3 from "../dist/audio/mine.mp3";
import Mine2Mp3 from "../dist/audio/mine2.mp3";
import BombMp3 from "../dist/audio/bomb.mp3";
import ItemMp3 from "../dist/audio/item.mp3";

import title from "../dist/img/title.png";
import snowflake from "../dist/img/snowflake.png";
import nl from "../dist/img/nl.png";
import nlp from "../dist/img/nlp.png";

import bg from "../dist/img/bg.png";
import tiles from "../dist/img/minetileset-extruded.png";
import smoke from "../dist/img/smoke.png";
import gubbe2 from "../dist/img/gubbe2.png";


/**
 * Scene that generates a new dungeon
 */
export default class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MainScene",
    });
  }

  preload() {
    this.gameSettings = {
      ui: {
        death: document.getElementById("death"),
        menu: document.getElementById("menu"),
        mine: document.getElementById("mine"),
        levelSelect: document.getElementById("levelSelect"),
        go: document.getElementById("go"),
        title: document.getElementById("title"),
        levelTextOverlay: document.getElementById("levelTextOverlay"),
        levelText: document.getElementById("levelText"),
        levelCountdown: document.getElementById("levelCountdown"),
        success: document.getElementById("success"),
        bomb: document.getElementById("bomb"),
        oxygen: document.getElementById("oxygen"),
      }
    };

    const savedInventory = window.localStorage.getItem("spelsylt5-inventory");

    if (savedInventory) {
      this.gameSettings.inventory = JSON.parse(savedInventory);
      document.getElementById("firstTimeContainer").style.display = "none";
      document.getElementById("inventoryCraftingContainer").style.display = "block";
    } else {
      this.gameSettings.inventory = {
        cloudberry: 0,
        iron: 0,
        red: 0,
        yellow: 0,
        blue: 0,
        diamond: 0,
        bomb: 0,
        speed: 75,
        oxygen: 30,
        diamonddrill: 0,
      };
    }

    this.load.audio("ground", GroundMp3);
    this.load.audio("wind", WindMp3);
    this.load.audio("mine", MineMp3);
    this.load.audio("mine2", Mine2Mp3);
    this.load.audio("bomb", BombMp3);
    this.load.audio("item", ItemMp3);

    this.load.image("title", title);
    this.load.image("snowflake", snowflake);
    this.load.image("nl", nl);
    this.load.image("nlp", nlp);

    this.load.image("bg", bg);
    this.load.image("tiles", tiles);
    this.load.image("smoke", smoke);

    console.log(gubbe2)

    this.load.spritesheet("characters", "./" + gubbe2, {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });

    this.load.spritesheet("bomb", "./" + bomb, {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });

    this.gameSettings.ui.title.innerHTML = `<div  style="margin-top: -85px; font-size: 40px; color: rgba(255,255,255,0.8)">Något sover<br />&nbsp;under Aitik</div>`;
  }

  createSnow() {
    const emitter = this.add.particles("snowflake").createEmitter({
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.7, end: 0 },
      blendMode: "NORMAL",
      lifespan: 6000,
      gravityX: -50,
      gravityY: 30,
      emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 800, 500) },
    });
  }

  create() {
    this.groundMusic = this.sound.add("ground", { loop: true });
    this.windSound = this.sound.add("wind", { loop: true, volume: 0.5 });
    this.mineMusic1 = this.sound.add("mine", { loop: true, volume: 0 });
    this.mineMusic2 = this.sound.add("mine2", { loop: true, volume: 0 });
    this.mineMusic = this.mineMusic1;
    this.groundMusic.play();
    this.windSound.play();
    this.mineMusic.play();
    this.mineMusic2.play();

    this.add.image(400, 300, "title");

    this.createSnow();

    this.createNorthernLights();

    this.setupMenu();

    this.updateMenu();

    this.events.on("pause", () => {
      this.gameSettings.ui.menu.style.display = "none";

      this.gameSettings.ui.mine.style.display = "flex";
      this.gameSettings.ui.levelTextOverlay.style.display = "none";

      this.previousTime = null;
      this.levelCountdown = null;
    });

    this.events.on("resume", () => {
      this.tweens.add({
        targets: [this.groundMusic],
        volume: { value: 1, duration: 5000 },
        yoyo: false,
        loop: 0,
      });

      this.tweens.add({
        targets: [this.windSound],
        volume: { value: 0.5, duration: 5000 },
        yoyo: false,
        loop: 0,
      });

      this.tweens.add({
        targets: [this.mineMusic],
        volume: { value: 0, duration: 3000 },
        yoyo: false,
        loop: 0,
      });

      this.gameSettings.ui.menu.style.display = "flex";
      this.gameSettings.ui.mine.style.display = "none";
      this.gameSettings.ui.death.style.display = "none";
      this.gameSettings.ui.success.style.display = "none";

      this.updateMenu();
    });

    this.input.keyboard.on("keydown", () => {
      this.startGame();
    });
  }

  startGame() {
    this.gameSettings.ui.title.style.display = "none";
    this.gameSettings.ui.menu.style.display = "flex";
  }

  setupMenu() {
    document.getElementById("craftBomb").addEventListener("click", () => {
      if (this.gameSettings.inventory.iron >= 10) {
        this.gameSettings.inventory.bomb = this.gameSettings.inventory.bomb + 1;
        this.gameSettings.inventory.iron = this.gameSettings.inventory.iron - 10;
        this.updateMenu();
      }
    });

    document.getElementById("craftSpeed").addEventListener("click", () => {
      if (this.gameSettings.inventory.iron >= 3 && this.gameSettings.inventory.cloudberry >= 5 && this.gameSettings.inventory.speed < 125) {
        this.gameSettings.inventory.speed = this.gameSettings.inventory.speed + 5;
        this.gameSettings.inventory.iron = this.gameSettings.inventory.iron - 3;
        this.gameSettings.inventory.cloudberry = this.gameSettings.inventory.cloudberry - 3;
        this.updateMenu();
      }
    });

    document.getElementById("craftOxygen").addEventListener("click", () => {
      if (this.gameSettings.inventory.blue >= 3 && this.gameSettings.inventory.red >= 3 && this.gameSettings.inventory.yellow >= 3) {
        this.gameSettings.inventory.oxygen = this.gameSettings.inventory.oxygen + 15;
        this.gameSettings.inventory.red = this.gameSettings.inventory.red - 3;
        this.gameSettings.inventory.blue = this.gameSettings.inventory.blue - 3;
        this.gameSettings.inventory.yellow = this.gameSettings.inventory.yellow - 3;
        this.updateMenu();
      }
    });

    document.getElementById("craftDiamondDrill").addEventListener("click", () => {
      if (this.gameSettings.inventory.diamond >= 5 && this.gameSettings.inventory.diamonddrill === 0) {
        console.log("asd");

        this.gameSettings.inventory.diamonddrill = 1;
        this.gameSettings.inventory.diamond = this.gameSettings.inventory.diamond - 5;

        this.updateMenu();
      }
    });

    Array.prototype.forEach.call(document.getElementsByClassName("goDepth"), (e) => {
      e.addEventListener("click", () => {
        this.gameSettings.level = e.dataset.level;

        this.mineMusic = this.mineMusic1;

        switch (this.gameSettings.level) {
          case "1":
            this.gameSettings.ui.levelText.innerHTML = `<h3>DEPTH 100</h3> A good place to collect Iron <img src="img/iron.png" class="pixelImage"> and cloudberries <img src="img/cloudberry.png" class="pixelImage">. Make sure you get back to the lift <img src="img/elevator.png" class="pixelImage"> before the oxygen timer runs out. Good luck!`;
            break;
          case "2":
            this.gameSettings.ui.levelText.innerHTML = `<h3>DEPTH 200</h3> If you have bought bombs you can blow up hard rocks <img src="img/stoneRock.png" class="pixelImage"> and collect their red, green and blue stones.`;
            break;
          case "3":
            this.gameSettings.ui.levelText.innerHTML = `<h3>DEPTH 300</h3> Bombs are needed to navigate here. At this depth you can find diamond <img src="img/diamond.png" class="pixelImage"> which are needed to build the diamond drill and going below 300 depth.`;
            break;
          case "4":
            this.gameSettings.ui.levelText.innerHTML = `<h3>DEPTH 400</h3> Maybe we weren't supposed to mine this deep... n'gha'agl`;
            break;
          case "5":
            this.mineMusic = this.mineMusic2;
            this.gameSettings.ui.levelText.innerHTML = `<h3>DEPTH 500</h3> What are those symbols? Didn't I see something similar on the level above? Hnahr'luhh ah ch'nglui`;
            break;
        }

        this.gameSettings.ui.menu.style.display = "none";
        this.gameSettings.ui.title.style.display = "none";
        this.gameSettings.ui.levelTextOverlay.style.display = "flex";

        document.getElementById("firstTimeContainer").style.display = "none";
        document.getElementById("inventoryCraftingContainer").style.display = "block";

        this.previousTime = -1;

        this.tweens.add({
          targets: [this.groundMusic, this.windSound],
          volume: { value: 0, duration: 5000 },
          yoyo: false,
          loop: 0,
        });

        this.tweens.add({
          targets: [this.mineMusic],
          volume: { value: 1, duration: 5000 },
          yoyo: false,
          loop: 0,
        });

        this.levelCountdown = this.time.addEvent({
          delay: 5000,
          callback: () => {
            this.scene.pause();
            this.scene.launch("MineScene", this.gameSettings);
          },
          callbackScope: this,
          loop: false,
        });
      });
    });
  }

  update() {
    if (this.levelCountdown) {
      const currentTime = Math.floor(this.levelCountdown.getElapsedSeconds());

      if (currentTime > this.previousTime) {
        console.log(currentTime);
        this.previousTime = currentTime;
        this.gameSettings.ui.levelCountdown.innerText = `${5 - currentTime}`;
      }
    }
  }

  updateMenu() {
    Object.keys(this.gameSettings.inventory).forEach((k) => {
      const e = document.getElementById("inv-" + k);
      if (e) {
        if (k === "oxygen") {
          e.innerText = `Oxygen ${this.gameSettings.inventory[k]} sec`;
        } else if (k === "speed") {
          e.innerText = `Speed ${this.gameSettings.inventory[k]}${this.gameSettings.inventory[k] == 125 ? " (max)" : ""}`;
        } else {
          e.innerText = this.gameSettings.inventory[k];
        }
      }
    });

    if(this.gameSettings.inventory.diamonddrill > 0) {
      document.getElementById("depth4").style.display = "inline";
      document.getElementById("depth5").style.display = "inline";
    }
    

    window.localStorage.setItem("spelsylt5-inventory", JSON.stringify(this.gameSettings.inventory));
  }

  createNorthernLights() {
    let i = 0;
    for (var z = 0; z < 10; z++) {
      this.time.addEvent({
        delay: z * 600,
        callback: () => {
          i++;

          let nl = this.add.image(150 + i * 64, 140, "nl");
          nl.alpha = 0.0;

          let nlp = this.add.image(0 + i * 64, 180, "nlp");
          nlp.alpha = 0.0;

          const emitterNl = this.add.particles("nl").createEmitter({
            x: 0,
            y: 0,
            alpha: { start: 0.0, end: 0.01 },
            blendMode: "NORMAL",
            lifespan: 9000,
            gravityX: 3,
            gravityY: -2,
          });

          emitterNl.startFollow(nl);

          this.tweens.add({
            targets: nl,
            y: { value: 120, duration: 8000, ease: "Sine" },
            yoyo: false,
            loop: -1,
            onLoop: () => {
              emitterNl.gravityX = emitterNl.gravityX * -1;
            },
          });

          const emitterNlp = this.add.particles("nlp").createEmitter({
            x: 0,
            y: 0,
            alpha: { start: 0.0, end: 0.02 },
            blendMode: "NORMAL",
            lifespan: 5000,
            gravityX: 2,
            gravityY: -3,
          });

          emitterNlp.startFollow(nlp);

          this.tweens.add({
            targets: nlp,
            y: { value: 220, duration: 7000, ease: "Sine" },
            yoyo: false,
            loop: -1,
            onLoop: () => {
              emitterNlp.gravityX = emitterNlp.gravityX * -1;
            },
          });
        },
        callbackScope: this,
        loop: false,
      });
    }
  }
}
