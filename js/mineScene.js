import Phaser from "phaser";
import Dungeon from "@mikewesthad/dungeon";
import Player from "./player.js";
import MineVisibility from './MineVisibility.js';


/**
 * Scene that generates a new dungeon
 */
export default class DungeonScene extends Phaser.Scene {
  preload() {
    this.load.image("tiles", "../img/minetileset-extruded.png");
    this.load.spritesheet(
      "characters",
      "../img/gubbe2.png",
      {
        frameWidth: 16,
        frameHeight: 16,
        margin: 0,
        spacing: 0
      }
    );

    this.load.spritesheet(
      "bomb",
      "../img/bomb.png",
      {
        frameWidth: 16,
        frameHeight: 16,
        margin: 0,
        spacing: 0
      }
    );

    this.load.spritesheet(
      "axe",
      "../img/yxa.png",
      {
        frameWidth: 16,
        frameHeight: 16,
        margin: 0,
        spacing: 0
      }
    );

  }

  create() {

    this.dungeon = new Dungeon({
      width: 50,
      height: 50,
      doorPadding: 2,
      rooms: {
        width: { min: 5, max: 11 },
        height: { min: 5, max: 11 },
        maxRooms: 5
      }
    });

    const map = this.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: this.dungeon.width,
      height: this.dungeon.height
    });
    const tileset = map.addTilesetImage("tiles", null, 16, 16, 1, 2); 
    this.groundLayer = map.createBlankDynamicLayer("Ground", tileset);

    this.gemLayer = map.createBlankDynamicLayer("Gems", tileset);
    this.gemLayer.fill(-1);

    this.gemStoneLayer = map.createBlankDynamicLayer("GemStone", tileset);
    this.gemStoneLayer.fill(-1);

    this.exitLayer = map.createBlankDynamicLayer("Exit", tileset);
    this.exitLayer.fill(-1);

    const startRoom = this.dungeon.rooms[0];
    this.gemLayer.putTileAt(19, startRoom.right-1, startRoom.top+1);
    this.gemLayer.putTileAt(9, startRoom.right-1, startRoom.top);

    
    console.log(startRoom)

    const rooms = this.dungeon.rooms.slice();
    rooms.shift();
    rooms.forEach(r => {
      var rand = Math.random();
      if (rand <= 0.5) {
        this.gemLayer.putTileAt(18, r.centerX, r.centerY);
      } else {
        this.gemStoneLayer.putTileAt(8, r.centerX, r.centerY);
      }
    })

    this.gemStoneLayer.setCollision(8)


    const mappedTiles = this.dungeon.getMappedTiles({ empty: -1, floor: 13, door: 13, wall: 2 });
    this.groundLayer.putTilesAt(mappedTiles, 0, 0);
    this.groundLayer.setCollision(2); // wall collision


    this.player = new Player(this, map.widthInPixels / 2, map.heightInPixels / 2);

    

    this.physics.add.collider(this.player.sprite, this.groundLayer);
    
    this.physics.add.collider(this.player.sprite, this.gemStoneLayer);

    this.gemLayer.setTileIndexCallback(18, this.collectGem, this);

    this.physics.add.overlap(this.player.sprite, this.gemLayer);

    const shadowLayer = map.createBlankDynamicLayer("Fog", tileset).fill(0);

    this.mineVisibility = new MineVisibility(shadowLayer);


    const camera = this.cameras.main;
    camera.startFollow(this.player.sprite);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // this.add
    //   .text(map.widthInPixels / 2, map.heightInPixels / 2, "Arrow keys to move", {
    //     font: "18px monospace",
    //     fill: "#000000",
    //     padding: { x: 20, y: 10 },
    //     backgroundColor: "#ffffff"
    //   })
    //   .setScrollFactor(0);


      this.cameras.main.setZoom(3);

      this.events.on('bombExplode', (bomb) => {
        console.log("bomb exploded " + bomb.x)

        const tileX = this.groundLayer.worldToTileX(bomb.x);
        const tileY = this.groundLayer.worldToTileY(bomb.y);

        var tileAt = this.gemStoneLayer.getTileAt(tileX,tileY)

        if(tileAt && tileAt.index === 8) {
          this.gemStoneLayer.putTileAt(-1, tileX, tileY);
          this.gemLayer.putTileAt(18, tileX, tileY);
        }
        

        
      }, this);

  }

  collectGem(player, tile) {
    
    this.gemLayer.removeTileAt(tile.x, tile.y);

    console.log("Took gem")
  }

  update(time, delta) {
    this.player.update();

    const playerTileX = this.groundLayer.worldToTileX(this.player.sprite.x);
    const playerTileY = this.groundLayer.worldToTileY(this.player.sprite.y);
    const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);

    this.mineVisibility.setActiveRoom(playerRoom);
    
  }
}
