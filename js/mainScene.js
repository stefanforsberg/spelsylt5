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
    this.add.image(400, 300, "title");

    this.createSnow();

    this.createNorthernLights();

    this.setupMenu();

    this.events.on('pause', () => {
        document.getElementById("menu").style.display = 'none';
    });

    this.events.on('resume', () => {
        document.getElementById("menu").style.display = 'flex';
    });
  }

  setupMenu() {
    document.getElementById("go").addEventListener("click", () => {
      this.scene.launch("MineScene");
      this.scene.pause();
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
            alpha: { start: 0.00, end: 0.01 },
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
              emitterNl.gravityY = emitterNl.gravityY * -1;
            },
          });

          const emitterNlp = this.add.particles("nlp").createEmitter({
            x: 0,
            y: 0,
            alpha: { start: 0.00, end: 0.02 },
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
