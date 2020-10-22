import Phaser from "phaser";

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
    this.load.image("title", "../img/title.png");
    this.load.image("snowflake", "../img/snowflake.png");
    this.load.image("nl", "../img/nl.png");
    this.load.image("nlp", "../img/nlp.png");
  }

  createSnow() {
    const emitter = this.add.particles("snowflake").createEmitter({
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.6, end: 0 },
      blendMode: "NORMAL",
      lifespan: 4000,
      gravityX: -10,
      gravityY: 30,
      emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 800, 500) },
    });
  }

  create() {
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
      },
      inventory: {
        cloudberry: 100,
        iron: 100,
        red: 9,
        yellow: 9,
        blue: 9,
        diamond: 5,
        bomb: 100,
        speed: 75,
        oxygen: 30,
        diamonddrill: 0,
      },
    };

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
      this.gameSettings.ui.menu.style.display = "flex";
      this.gameSettings.ui.mine.style.display = "none";
      this.gameSettings.ui.death.style.display = "none";
      this.gameSettings.ui.success.style.display = "none";

      this.updateMenu();
    });
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
        this.gameSettings.inventory.diamonddrill = 1;
        this.gameSettings.inventory.diamond = this.gameSettings.inventory.diamond - 5;

        let o = document.createElement("option");
        o.text = "Depth 400";
        o.value = 4;

        this.gameSettings.ui.levelSelect.add(o);

        o = document.createElement("option");
        o.text = "Depth 500";
        o.value = 5;

        this.gameSettings.ui.levelSelect.add(o);

        this.updateMenu();
      }
    });

    this.gameSettings.ui.go.addEventListener("click", () => {
      this.gameSettings.level = this.gameSettings.ui.levelSelect.options[this.gameSettings.ui.levelSelect.selectedIndex].value;

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
          this.gameSettings.ui.levelText.innerHTML = `<h3>DEPTH 500</h3> What are those symbols? Didn't I see something similar on the level above? Hnahr'luhh ah ch'nglui`;
          break;
      }

      this.gameSettings.ui.menu.style.display = "none";
      this.gameSettings.ui.title.style.display = "none";
      this.gameSettings.ui.levelTextOverlay.style.display = "flex";

      this.previousTime = -1;

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
