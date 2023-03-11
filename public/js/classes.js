
class Tree {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.image = window.Assets.tree;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
    }

    setSize(size) {
        this.size = size;
    }
}

class Rock {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.image = window.Assets.rock;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
    }

    setSize(size) {
        this.size = size;
    }
}

/**
 * @typedef {Object} TerrainTile
 * @property {number} x
 * @property {number} y
 * @property {number} index
 * @property {number} [height]
 * @property {number} [width]
 * @property {number} [id]
 */

class Tile {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {TerrainTile} tile
     * @param {('grass'|'sand'|'water')} type
     */
    constructor(x, y, tile, type) {
        this.x = x;
        this.y = y;
        this.tile = tile;
        this.type = type;
    }

    draw(ctx) {
        ctx.fillStyle = this.typeToColor(this.type);
        ctx.fillRect(this.x, this.y, this.tile.width, this.tile.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(0, 0, 0, .15)";
        ctx.strokeRect(this.x, this.y, this.tile.width, this.tile.height);
        return this;
    }

    drawText(ctx, text) {
        ctx.fillStyle = "black";
        ctx.fillText(text, this.x - this.tile.width / 2, this.y - this.tile.height / 2.5);
        ctx.textAlign = "center";
        return this;
    }

    typeToColor(type) {
        if (type === "water") return "blue";
        if (type === "sand") return "yellow";
        if (type === "grass") return "green";

        return "#000000";
    }
}