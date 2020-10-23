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
      case "3":
        this.createLevel3();
        break;
      case "4":
        this.createLevel4();
        break;
      case "5":
        this.createLevel5();
        break;
      default:
        this.createLevel1();
        break;
    }

    this.player = new Player(this.scene, this.map.widthInPixels / 2, this.map.heightInPixels / 2);

    this.player.inventory.bomb = this.scene.gameSettings.inventory.bomb;

    this.scene.physics.add.collider(this.player.sprite, this.groundLayer);

    this.scene.physics.add.collider(this.player.sprite, this.gemStoneLayer);

    this.scene.physics.add.overlap(this.player.sprite, this.gemLayer);

    this.scene.physics.add.overlap(this.player.sprite, this.exitLayer);

    this.scene.physics.add.overlap(this.player.sprite, this.symbolsLayer);

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
      const tile = new Phaser.Tilemaps.Tile(this.gemLayer, tileAt.properties.tileIndex, tileX, tileY);

      tile.properties.amount = tileAt.properties.amount;
      tile.properties.type = tileAt.properties.type;

      this.gemStoneLayer.putTileAt(-1, tileX, tileY);
      this.gemLayer.putTileAt(tile, tileX, tileY);
    } else if (tileAt && tileAt.index === 21) {
      this.gemStoneLayer.putTileAt(-1, tileX, tileY);
    }
  }

  exitLevel() {
    const mainScene = this.scene.scene.get("MainScene");

    Object.keys(mainScene.gameSettings.inventory).forEach((k) => {
      if (k === "bomb" || k === "speed" || k === "diamonddrill" || k === "oxygen") {
        mainScene.gameSettings.inventory[k] = this.player.inventory[k];
      } else {
        mainScene.gameSettings.inventory[k] += this.player.inventory[k];
      }
    });

    this.scene.endLevel(true);
  }

  collectGem(player, tile) {
    this.gemLayer.removeTileAt(tile.x, tile.y);
    this.player.pickUpGem(tile.properties.type, tile.properties.amount);
  }

  touchSymbol(player, tile) {

    if(this.scene.gameSettings.level !== "5") {
      return;
    }

    this.symbolsLayer.setTileIndexCallback(tile.index, null, this);

    this.touchedSymbols.push(tile.index);

    if(this.touchedSymbols.join("") === "82838485") {
      
      
      const cam = this.scene.cameras.main;

      this.player.freeze();

      cam.shake(700, 0.0005);

      cam.fade(700, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => {
        this.scene.scene.pause();
        this.scene.gameSettings.ui.mine.style.display = 'none';
        document.getElementById("end").style.display = 'flex';
      });
    }
  }

  update(time, delta) {
    this.player.update();

    this.playerTileX = this.groundLayer.worldToTileX(this.player.sprite.x);
    this.playerTileY = this.groundLayer.worldToTileY(this.player.sprite.y);
    const playerRoom = this.dungeon.getRoomAt(this.playerTileX, this.playerTileY);

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
        maxRooms: 8,
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
        var tile = new Phaser.Tilemaps.Tile(this.gemLayer, 28, r.centerX, r.centerY);
        tile.properties.amount = Phaser.Math.Between(5, 10);
        tile.properties.type = "iron";
        this.gemLayer.putTileAt(tile, r.centerX, r.centerY);
      }

      if (rand <= 0.5) {
        var tile = new Phaser.Tilemaps.Tile(this.gemLayer, 39, r.centerX, r.centerY);
        tile.properties.amount = Phaser.Math.Between(5, 10);
        tile.properties.type = "cloudberry";

        const x = Phaser.Math.Between(r.x+1, r.x+r.width-2);
        const y = Phaser.Math.Between(r.y+1, r.y+r.height-2);
        this.gemLayer.putTileAt(tile, x, y);
        this.groundLayer.putTileAt(32, x, y);
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
        var tile = new Phaser.Tilemaps.Tile(this.gemLayer, 8, r.centerX, r.centerY);
        tile.properties.amount = Phaser.Math.Between(5, 10);
        tile.properties.type = "red";
        tile.properties.tileIndex = 38;
        this.gemStoneLayer.putTileAt(tile, r.centerX, r.centerY);
      } else if (rand <= 0.66) {
        var tile = new Phaser.Tilemaps.Tile(this.gemLayer, 8, r.centerX, r.centerY);
        tile.properties.amount = Phaser.Math.Between(5, 10);
        tile.properties.type = "blue";
        tile.properties.tileIndex = 48;
        this.gemStoneLayer.putTileAt(tile, r.centerX, r.centerY);
      } else if (rand <= 1) {
        var tile = new Phaser.Tilemaps.Tile(this.gemLayer, 8, r.centerX, r.centerY);
        tile.properties.amount = Phaser.Math.Between(5, 10);
        tile.properties.type = "yellow";
        tile.properties.tileIndex = 58;
        this.gemStoneLayer.putTileAt(tile, r.centerX, r.centerY);
      }
    });
  }

  createLevel3() {
    this.dungeon = new Dungeon({
      width: 50,
      height: 50,
      doorPadding: 2,
      rooms: {
        width: { min: 6, max: 13 },
        height: { min: 6, max: 13 },
        maxRooms: 20,
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

    const startRoom = rooms.shift();

    this.exitLayer.putTileAt(59, startRoom.x + 2, startRoom.y + 2);

    startRoom.getDoorLocations().forEach((d) => {
      this.gemStoneLayer.putTileAt(21, startRoom.x + d.x, startRoom.y + d.y);
    });

    const diamondRoom1 = Phaser.Utils.Array.RemoveRandomElement(rooms);
    const diamondRoom2 = Phaser.Utils.Array.RemoveRandomElement(rooms);

    let tile = new Phaser.Tilemaps.Tile(this.gemLayer, 68, diamondRoom1.centerX, diamondRoom1.centerY);

    tile.properties.amount = 1;
    tile.properties.type = "diamond";
    tile.properties.tileIndex = 68;
    this.gemLayer.putTileAt(tile, diamondRoom1.centerX, diamondRoom1.centerY);

    tile = new Phaser.Tilemaps.Tile(this.gemLayer, 68, diamondRoom2.centerX, diamondRoom2.centerY);

    tile.properties.amount = 1;
    tile.properties.type = "diamond";
    tile.properties.tileIndex = 68;
    this.gemLayer.putTileAt(tile, diamondRoom2.centerX, diamondRoom2.centerY);

    rooms.forEach((r) => {
      var rand = Math.random();
      if (rand <= 0.33) {
        var tile = new Phaser.Tilemaps.Tile(this.gemLayer, 8, r.centerX, r.centerY);
        tile.properties.amount = Phaser.Math.Between(5, 10);
        tile.properties.type = "red";
        tile.properties.tileIndex = 38;
        this.gemStoneLayer.putTileAt(tile, r.centerX, r.centerY);
      } else if (rand <= 0.66) {
        var tile = new Phaser.Tilemaps.Tile(this.gemLayer, 8, r.centerX, r.centerY);
        tile.properties.amount = Phaser.Math.Between(5, 10);
        tile.properties.type = "blue";
        tile.properties.tileIndex = 48;
        this.gemStoneLayer.putTileAt(tile, r.centerX, r.centerY);
      } else if (rand <= 1) {
        var tile = new Phaser.Tilemaps.Tile(this.gemLayer, 8, r.centerX, r.centerY);
        tile.properties.amount = Phaser.Math.Between(5, 10);
        tile.properties.type = "yellow";
        tile.properties.tileIndex = 58;
        this.gemStoneLayer.putTileAt(tile, r.centerX, r.centerY);
      }
    });
  }

  createLevel4() {
    this.dungeon = new Dungeon({
      width: 50,
      height: 50,
      doorPadding: 2,
      rooms: {
        width: { min: 6, max: 13 },
        height: { min: 6, max: 13 },
        maxRooms: 20,
      },
    });

    this.map = this.scene.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: this.dungeon.width,
      height: this.dungeon.height,
    });

    this.createCommonLevel("cult");

    this.dungeon.rooms.forEach((room) => {
      this.groundLayer.weightedRandomize(room.x + 1, room.y + 1, room.width - 2, room.height - 2, [
        { index: [71], weight: 9 },
        { index: [60, 61, 62, 70, 72, 81, 81], weight: 1 },
        { index: [63, 64, 65, 66, 67], weight: 0.05}
      ]);

      this.scene.time.addEvent({
        delay: 2000,
        callback: () => {
          this.groundLayer.shuffle(room.x+1, room.y+1,room.width - 2, room.height - 2)
        },
        callbackScope: this,
        loop: true
      });
    });

    

    const rooms = this.dungeon.rooms.slice();
    rooms.shift();
    const roomSymbol1 = Phaser.Utils.Array.RemoveRandomElement(rooms);
    const roomSymbol2 = Phaser.Utils.Array.RemoveRandomElement(rooms);
    const roomSymbol3 = Phaser.Utils.Array.RemoveRandomElement(rooms);
    const roomSymbol4 = Phaser.Utils.Array.RemoveRandomElement(rooms);

    let addSymbols = (r, tileIndexSymbol, tileIndexNumber) => {

      this.gemStoneLayer.putTileAt(8, r.centerX, r.centerY);

      this.symbolsLayer.putTileAt(tileIndexSymbol, r.centerX-1, r.centerY);
      this.symbolsLayer.putTileAt(tileIndexNumber, r.centerX, r.centerY);
      this.symbolsLayer.putTileAt(tileIndexSymbol, r.centerX+1, r.centerY);
      this.symbolsLayer.putTileAt(tileIndexSymbol, r.centerX-1, r.centerY-1);
      this.symbolsLayer.putTileAt(tileIndexSymbol, r.centerX, r.centerY-1);
      this.symbolsLayer.putTileAt(tileIndexSymbol, r.centerX+1, r.centerY-1);
      this.symbolsLayer.putTileAt(tileIndexSymbol, r.centerX-1, r.centerY+1);
      this.symbolsLayer.putTileAt(tileIndexSymbol, r.centerX, r.centerY+1);
      this.symbolsLayer.putTileAt(tileIndexSymbol, r.centerX+1, r.centerY+1);
    }

    addSymbols(roomSymbol1, 82, 86);
    addSymbols(roomSymbol2, 83, 87);
    addSymbols(roomSymbol3, 84, 88);
    addSymbols(roomSymbol4, 85, 89);
    
  }

  createLevel5() {
    this.dungeon = new Dungeon({
      width: 50,
      height: 50,
      doorPadding: 2,
      rooms: {
        width: { min: 20, max: 20 },
        height: { min: 20, max: 20 },
        maxRooms: 1,
      },
    });

    this.map = this.scene.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: this.dungeon.width,
      height: this.dungeon.height,
    });

    this.createCommonLevel("cult");

    const room = this.dungeon.rooms.shift()

    this.groundLayer.weightedRandomize(room.x + 1, room.y + 1, room.width - 2, room.height - 2, [
      { index: [0], weight: 7 },
    ]);

    this.symbolsLayer.putTileAt(82, room.x+1, room.y+1);
    this.symbolsLayer.putTileAt(83, room.x+2, room.y+1);
    this.symbolsLayer.putTileAt(84, room.x+3, room.y+1);
    this.symbolsLayer.putTileAt(85, room.x+4, room.y+1);

    this.symbolsLayer.shuffle(room.x+1, room.y+1,room.width - 2, room.height - 2)

    this.touchedSymbols = []
  }


  createCommonLevel(levelSeed) {
    const tileset = this.map.addTilesetImage("tiles", null, 16, 16, 1, 2);

    let mappedTiles;

    if (levelSeed !== "cult") {
      mappedTiles = this.dungeon.getMappedTiles({
        empty: -1,
        floor: 13,
        door: 13,
        wall: 2,
      });
    } else {
      mappedTiles = this.dungeon.getMappedTiles({
        empty: -1,
        floor: 71,
        door: 71,
        wall: 2,
      });
    }

    this.groundLayer = this.map.createBlankDynamicLayer("Ground", tileset);
    this.groundLayer.putTilesAt(mappedTiles, 0, 0);
    this.groundLayer.setCollision(2);

    this.dungeon.rooms.forEach((room) => {
      this.groundLayer.weightedRandomize(room.x + 1, room.y + 1, room.width - 2, room.height - 2, [
        { index: [12, 13, 14], weight: 9 },
        { index: [22, 23, 24, 25], weight: 1 },
      ]);
    });

    this.symbolsLayer = this.map.createBlankDynamicLayer("Symbols", tileset);
    this.symbolsLayer.setTileIndexCallback(82, this.touchSymbol, this);
    this.symbolsLayer.setTileIndexCallback(83, this.touchSymbol, this);
    this.symbolsLayer.setTileIndexCallback(84, this.touchSymbol, this);
    this.symbolsLayer.setTileIndexCallback(85, this.touchSymbol, this);

    this.gemLayer = this.map.createBlankDynamicLayer("Gems", tileset);
    this.gemLayer.fill(-1);
    this.gemLayer.setTileIndexCallback(18, this.collectGem, this);
    this.gemLayer.setTileIndexCallback(28, this.collectGem, this);
    this.gemLayer.setTileIndexCallback(38, this.collectGem, this);
    this.gemLayer.setTileIndexCallback(48, this.collectGem, this);
    this.gemLayer.setTileIndexCallback(58, this.collectGem, this);
    this.gemLayer.setTileIndexCallback(68, this.collectGem, this);
    this.gemLayer.setTileIndexCallback(39, this.collectGem, this);

    this.gemStoneLayer = this.map.createBlankDynamicLayer("GemStone", tileset);
    this.gemStoneLayer.fill(-1);
    this.gemStoneLayer.setCollision(8);
    this.gemStoneLayer.setCollision(21);

    this.exitLayer = this.map.createBlankDynamicLayer("Exit", tileset);
    this.exitLayer.fill(-1);

    const startRoom = this.dungeon.rooms[0];
    this.exitLayer.putTileAt(19, startRoom.right - 1, startRoom.top + 1);
    this.exitLayer.putTileAt(9, startRoom.right - 1, startRoom.top);
    this.exitLayer.setTileIndexCallback(19, this.exitLevel, this);

    

    const shadowLayer = this.map.createBlankDynamicLayer("Fog", tileset).fill(0);

    this.mineVisibility = new MineVisibility(shadowLayer);
  }
}
