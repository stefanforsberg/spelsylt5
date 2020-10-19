import MineVisibility from "./MineVisibility.js";
import Dungeon from "@mikewesthad/dungeon";
import Player from "./player.js";

export default class Level {
  create(scene) {
    this.scene = scene;

    switch (this.scene.gameSettings.level) {
      case "1":
        this.createLevel1();
        break;
      case "2":
        this.createLevel2();
        break;
      default:
        this.createLevel1();
        break;
    }

    this.player = new Player(
      this.scene,
      this.map.widthInPixels / 2,
      this.map.heightInPixels / 2
    );

    this.player.inventory.bomb = this.scene.gameSettings.inventory.bomb;

    this.scene.physics.add.collider(this.player.sprite, this.groundLayer);

    this.scene.physics.add.collider(this.player.sprite, this.gemStoneLayer);

    this.scene.physics.add.overlap(this.player.sprite, this.gemLayer);

    this.scene.physics.add.overlap(this.player.sprite, this.exitLayer);

    const camera = this.scene.cameras.main;
    camera.startFollow(this.player.sprite);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    return this;
  }

  explodingBomb(bomb) {

    const tileX = this.groundLayer.worldToTileX(bomb.x);
    const tileY = this.groundLayer.worldToTileY(bomb.y);

    var tileAt = this.gemStoneLayer.getTileAt(tileX, tileY);

    if (tileAt && tileAt.index === 8) {
      const tile = new Phaser.Tilemaps.Tile(
        this.gemLayer,
        tileAt.properties.tileIndex,
        tileX,
        tileY
      );

      tile.properties.amount = tileAt.properties.amount;
      tile.properties.type = tileAt.properties.type;

      this.gemStoneLayer.putTileAt(-1, tileX, tileY);
      this.gemLayer.putTileAt(tile, tileX, tileY);
    }
  }

  exitLevel() {
    this.scene.scene.stop();

    const mainScene = this.scene.scene.get("MainScene")

    Object.keys(mainScene.gameSettings.inventory).forEach(k => {
      mainScene.gameSettings.inventory[k] += this.player.inventory[k];
    })

    mainScene.updateMenu();
    this.scene.scene.resume("MainScene");
  }

  collectGem(player, tile) {
    this.gemLayer.removeTileAt(tile.x, tile.y);
    this.player.pickUpGem(tile.properties.type, tile.properties.amount);
  }

  update(time, delta) {
    this.player.update();

    const playerTileX = this.groundLayer.worldToTileX(this.player.sprite.x);
    const playerTileY = this.groundLayer.worldToTileY(this.player.sprite.y);
    const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);

    this.mineVisibility.setActiveRoom(playerRoom);
  }

  createLevel1() {
    this.dungeon = new Dungeon({
      width: 50,
      height: 50,
      doorPadding: 2,
      rooms: {
        width: { min: 5, max: 11 },
        height: { min: 5, max: 11 },
        maxRooms: 5,
      },
    });

    this.map = this.scene.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: this.dungeon.width,
      height: this.dungeon.height,
    });

    this.createCommonLevel();

    const rooms = this.dungeon.rooms.slice();
    rooms.shift();
    rooms.forEach((r) => {
      var rand = Math.random();
      if (rand <= 0.8) {
        var tile = new Phaser.Tilemaps.Tile(
          this.gemLayer,
          28,
          r.centerX,
          r.centerY
        );
        tile.properties.amount = Phaser.Math.Between(5, 10);
        tile.properties.type = "iron";
        this.gemLayer.putTileAt(tile, r.centerX, r.centerY);
      } else {
        console.log("not stone");
      }
    });
  }

  createLevel2() {
    this.dungeon = new Dungeon({
      width: 50,
      height: 50,
      doorPadding: 2,
      rooms: {
        width: { min: 5, max: 11 },
        height: { min: 5, max: 11 },
        maxRooms: 10,
      },
    });

    this.map = this.scene.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: this.dungeon.width,
      height: this.dungeon.height,
    });

    this.createCommonLevel();

    const rooms = this.dungeon.rooms.slice();
    rooms.shift();
    rooms.forEach((r) => {
      var rand = Math.random();
      if (rand <= 0.33) {
        var tile = new Phaser.Tilemaps.Tile(
          this.gemLayer,
          8,
          r.centerX,
          r.centerY
        );
        tile.properties.amount = Phaser.Math.Between(5, 10);
        tile.properties.type = "red";
        tile.properties.tileIndex = 38;
        this.gemStoneLayer.putTileAt(tile, r.centerX, r.centerY);
      } else if (rand <= 0.66) {
        var tile = new Phaser.Tilemaps.Tile(
          this.gemLayer,
          8,
          r.centerX,
          r.centerY
        );
        tile.properties.amount = Phaser.Math.Between(5, 10);
        tile.properties.type = "blue";
        tile.properties.tileIndex = 48;
        this.gemStoneLayer.putTileAt(tile, r.centerX, r.centerY);
      } else if (rand <= 1) {
        var tile = new Phaser.Tilemaps.Tile(
          this.gemLayer,
          8,
          r.centerX,
          r.centerY
        );
        tile.properties.amount = Phaser.Math.Between(5, 10);
        tile.properties.type = "yellow";
        tile.properties.tileIndex = 58;
        this.gemStoneLayer.putTileAt(tile, r.centerX, r.centerY);
      }
    });
  }

  createCommonLevel() {
    const tileset = this.map.addTilesetImage("tiles", null, 16, 16, 1, 2);
    this.groundLayer = this.map.createBlankDynamicLayer("Ground", tileset);

    this.gemLayer = this.map.createBlankDynamicLayer("Gems", tileset);
    this.gemLayer.fill(-1);
    this.gemLayer.setTileIndexCallback(18, this.collectGem, this);
    this.gemLayer.setTileIndexCallback(28, this.collectGem, this);
    this.gemLayer.setTileIndexCallback(38, this.collectGem, this);
    this.gemLayer.setTileIndexCallback(48, this.collectGem, this);
    this.gemLayer.setTileIndexCallback(58, this.collectGem, this);

    this.gemStoneLayer = this.map.createBlankDynamicLayer("GemStone", tileset);
    this.gemStoneLayer.fill(-1);
    this.gemStoneLayer.setCollision(8);
    this.gemStoneLayer.setCollision(8);
    this.gemStoneLayer.setCollision(8);

    this.exitLayer = this.map.createBlankDynamicLayer("Exit", tileset);
    this.exitLayer.fill(-1);

    const startRoom = this.dungeon.rooms[0];
    this.exitLayer.putTileAt(19, startRoom.right - 1, startRoom.top + 1);
    this.exitLayer.putTileAt(9, startRoom.right - 1, startRoom.top);
    this.exitLayer.setTileIndexCallback(19, this.exitLevel, this);

    const mappedTiles = this.dungeon.getMappedTiles({
      empty: -1,
      floor: 13,
      door: 13,
      wall: 2,
    });
    this.groundLayer.putTilesAt(mappedTiles, 0, 0);
    this.groundLayer.setCollision(2);

    const shadowLayer = this.map
      .createBlankDynamicLayer("Fog", tileset)
      .fill(0);

    this.mineVisibility = new MineVisibility(shadowLayer);
  }
}
