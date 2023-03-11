

class Terrain {
    constructor(width, height, tiles) {
        this.width = width;
        this.height = height;
        this.image = null;
        this.tiles = tiles;
    }

    typeToColor(type, index) {
        switch (type) {
            case "grass":
                return "green";
            case "water":
                return "blue";
            case "sand":
                return "yellow";
        }
        return "#000000";
    }

    generate(cb) {
        var ctx = document.createElement("canvas").getContext("2d");

        ctx.canvas.width = this.width * Constants.TILE_WIDTH;
        ctx.canvas.height = this.height * Constants.TILE_HEIGHT;

        for(let x = 0; x < this.tiles.length; x++) {
            for(let y = 0; y < this.tiles[x].length; y++) {
                let tile = this.tiles[x][y];
                let type = tile.index > 0.80 ? "water" : tile.index > 0.7 ? "sand": "grass";
                let tilePos = {x: x * Constants.TILE_WIDTH, y: y * Constants.TILE_HEIGHT};

                new Tile(tilePos.x, tilePos.y, tile, type).draw(ctx).drawText(ctx, tile.id);
            }
        }

        for(let x = 0; x < this.tiles.length; x++) {
            for(let y = 0; y < this.tiles[x].length; y++) {
                let tile = this.tiles[x][y];
                if(tile.object) {
                    console.log(tile.object)
                    if(tile.object.type === "tree") {
                        new Tree(tile.x, tile.y, Assets.tree.size).draw(ctx);
                    }
                    else if(tile.object.type === "rock") {
                        new Rock(tile.x, tile.y, Assets.rock.size).draw(ctx);
                    }
                }
            }
        }

        this.image = new Image();
        this.image.src = ctx.canvas.toDataURL();
        this.image.onload = () => {
            cb(this);
        };
    }

    draw(context, xView, yView) {
        if (!this.image) {
            return error("Failed to load terrain image");
        }
        var sx, sy;
        var sWidth, sHeight, dWidth, dHeight;

        sx = xView;
        sy = yView;
    
        sWidth = context.canvas.width;
        sHeight = context.canvas.height;
        if (this.image.width - sx < sWidth) {
            sWidth = this.image.width - sx;
        }
        if (this.image.height - sy < sHeight) {
            sHeight = this.image.height - sy;
        }
    
        dWidth = sWidth;
        dHeight = sHeight;
    
        context.drawImage(this.image, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
    }
}

// Terrain.prototype.generate = function () {
//     var ctx = document.createElement("canvas").getContext("2d");
//     ctx.canvas.width = this.width * Constants.TILE_WIDTH;
//     ctx.canvas.height = this.height * Constants.TILE_HEIGHT;

//     let terrain = this.data?.flat();
//     for (let i = 0; i < terrain.length; i++) {
//         let block = terrain[i];
        
//         let type = block.index > 0.80 ? "water" : block.index > 0.7 ? "sand": "grass";

//         let tile = new Tile(block.x, block.y, Constants.TILE_WIDTH, Constants.TILE_HEIGHT, block.id, block.object || null, type);
//         tile.draw(ctx);
//         tile.drawText(ctx, block.id);
//     }

//     for(let i = 0; i < terrain.length; i++) {
//         let block = terrain[i];
//         if(block.object) {
//             if(block.object.type === "tree") {
//                 new Tree(block.x, block.y, 150).draw(ctx);
//             }
//             else if(block.object.type === "rock") {
//                 new Rock(block.x, block.y, 100).draw(ctx);
//             }
//         }
//     }

//     this.image = new Image();
//     this.image.src = ctx.canvas.toDataURL();
// }

function loadTerrain(data, start) {
    const canvas = document.getElementById("canvas");
    if (!canvas) {
        return error("Game canvas not found!");
    }

    /**
     * @type {CanvasRenderingContext2D}
     */
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return error("Game canvas context not found!");
    }

    ctx.canvas.width = window.outerWidth;
    ctx.canvas.height = window.outerHeight;
    console.log(data)
    new Terrain(data.options.width, data.options.height, data.tiles).generate((terrain) => {
        terrain.draw(ctx, 0, 0);
        success("Terrain drawn in " + (Date.now() - start).toFixed(0) + "ms");
        window.Terrain = terrain;
    });
    
}