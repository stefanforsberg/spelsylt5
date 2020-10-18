import MineVisibility from "./MineVisibility.js";
import Dungeon from "@mikewesthad/dungeon";
import Player from "./player.js";

export default class Level {
  create(scene) {
    this.scene = scene;
    this.createLevel1();

    this.player = new Player(
      this.scene,
      this.map.widthInPixels / 2,
      this.map.heightInPixels / 2
    );

    this.scene.physics.add.collider(this.player.sprite, this.groundLayer);

    this.scene.physics.add.collider(this.player.sprite, this.gemStoneLayer);

    this.scene.physics.add.overlap(this.player.sprite, this.gemLayer);

    this.scene.physics.add.overlap(this.player.sprite, this.exitLayer);

    const camera = this.scene.cameras.main;
    camera.startFollow(this.player.sprite);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    this.scene.events.on(
      "bombExplode",
      (bomb) => {
        console.log("bomb exploded " + bomb.x);

        const tileX = this.groundLayer.worldToTileX(bomb.x);
        const tileY = this.groundLayer.worldToTileY(bomb.y);

        var tileAt = this.gemStoneLayer.getTileAt(tileX, tileY);

        if (tileAt && tileAt.index === 8) {
          this.gemStoneLayer.putTileAt(-1, tileX, tileY);
          this.gemLayer.putTileAt(18, tileX, tileY);
        }
      },
      this.scene
    );

    return this;
  }

  exitLevel() {
    this.scene.stop();
    this.scene.resume("MainScene");
  }

  collectGem(player, tile) {
    console.log("gem")
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
        var tile = new Phaser.Tilemaps.Tile(this.gemLayer, 28, r.centerX, r.centerY);
        tile.properties.amount = Phaser.Math.Between(5,10);
        tile.properties.type = 'iron'
        this.gemLayer.putTileAt(tile, r.centerX, r.centerY);
        
      } else {
          console.log("not stone")
        // this.gemStoneLayer.putTileAt(8, r.centerX, r.centerY);
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

    this.gemStoneLayer = this.map.createBlankDynamicLayer("GemStone", tileset);
    this.gemStoneLayer.fill(-1);
    this.gemStoneLayer.setCollision(8);

    this.exitLayer = this.map.createBlankDynamicLayer("Exit", tileset);
    this.exitLayer.fill(-1);

    const startRoom = this.dungeon.rooms[0];
    this.exitLayer.putTileAt(19, startRoom.right - 1, startRoom.top + 1);
    this.exitLayer.putTileAt(9, startRoom.right - 1, startRoom.top);
    this.exitLayer.setTileIndexCallback(19, this.exitLevel, this.scene);

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
