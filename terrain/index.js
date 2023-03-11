const Simplex = require("perlin-simplex");
const { CANVAS_WIDTH, CANVAS_HEIGHT } = require("../database/temp");

/**
 * @typedef {Object} TerrainOptions
 * @property {number} octaves | 4
 * @property {number} persistence | 0.5
 * @property {number} lacunarity | 2.0
 * @property {number} frequency | 0.007
 * @property {number} amplitude | 1.0
 * @property {number} width | 100
 * @property {number} height | 100
 * @property {number} tileSize | 50
 * @property {number} seed | 0
 */

/**
 * @typedef {Object} TerrainObject
 * @property {string} type | "tree" | "rock"
 * @property {number} id
 */

/**
 * @typedef {Object} TerrainObjectsOptions
 * @property {number} minDistanceBetween | 10
 * 
 */

/**
 * @typedef {Object} TerrainTile
 * @property {number} x
 * @property {number} y
 * @property {number} index
 * @property {number} [height]
 * @property {number} [width]
 * @property {number} [id]
 */

/**
 * @typedef {Object} Terrain
 * @property {TerrainOptions} options
 * @property {TerrainTile[][]} tiles
 */

function tileHasObjectsInRadius(terrain, tile, radius) {
    for(let x = 0; x < terrain.length; x++) {
        for(let y = 0; y < terrain[x].length; y++) {
            let t = terrain[x][y];
            if(t.object) {
                let distance = Math.sqrt(Math.pow(t.x - tile.x, 2) + Math.pow(t.y - tile.y, 2));
                if(distance < radius) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * 
 * @param {TerrainTile[][]} terrain 
 * @param {TerrainObjectsOptions} options
 * @returns {TerrainObject[]}
 */
function generateTerrainObjects(terrain, options) {
    let objects = [];
    let grassTiles = terrain.flat().filter(t => t.index > 0.4);
    for(let i = 0; i < grassTiles.length; i++) {
        let tile = grassTiles[i];
        let tilesAround = tileHasObjectsInRadius(terrain.map(t => t.filter(a => a.index > 0.4)), tile, options.minDistanceBetween);
        if(tilesAround) {
            continue;
        }

        let random = Math.random();
        let type = random < 0.15 ? "tree" : random < 0.2 ? "rock" : null;
        let collisionLength = type === "tree" ? 10 : type === "rock" ? 5 : 0;
        let object = {
            type,
            id: i,
            collisionLength,
            x: tile.x,
            y: tile.y,
        }

        if(!type) {
            continue;
        }

        objects.push(object);
        tile.object = object;
    }

    console.log(objects.length)
    return objects;
}

function normalize(value, min, max) {
    return (value - min) / (max - min);
}

/**
 * @param {TerrainOptions} options
 * @returns {TerrainTile[][]}
 */
function generateTerrain(options = { octaves: 4, persistence: 0.5, lacunarity: 2.0, frequency: 0.007, amplitude: 1.0, width: 100, height: 100, tileSize: 50, seed: Math.random() * 1000 }) {
    const simplex = new Simplex();
    const terrain = [];
    let totalTiles = 0;

    let maxNoiseHeight = -Infinity;
    let minNoiseHeight = Infinity;

    for (let x = 0; x < options.width; x++) {
        terrain[x] = [];
        for (let y = 0; y < options.height; y++) {
            let noiseHeight = 0;
            let frequency = options.frequency;
            let amplitude = options.amplitude;
            
            for (let i = 0; i < options.octaves; i++) {
                let sampleX = x / options.width * frequency + options.seed;
                let sampleY = y / options.height * frequency + options.seed;
                let perlinValue = simplex.noise(sampleX, sampleY) * 2 - 1;
                noiseHeight += perlinValue * amplitude;
                amplitude *= options.persistence || 0.5;
                frequency *= options.lacunarity || 2.0;
            }

            if (noiseHeight > maxNoiseHeight) {
                maxNoiseHeight = noiseHeight;
            } else if (noiseHeight < minNoiseHeight) {
                minNoiseHeight = noiseHeight;
            }

            totalTiles++;
            terrain[x][y] = {
                x: x * (options.tileSize || 50),
                y: y * (options.tileSize || 50),
                index: noiseHeight,
                id: totalTiles,
                width: options.tileSize || 50,
                height: options.tileSize || 50,
            };
        }
    }

    for (let x = 0; x < options.width; x++) {
        for (let y = 0; y < options.height; y++) {
            terrain[x][y].index = normalize(terrain[x][y].index, minNoiseHeight, maxNoiseHeight);
        }
    }

    return { options, tiles: terrain};
}

module.exports = { generateTerrain, generateTerrainObjects }