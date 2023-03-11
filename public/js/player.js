

info("Player script loaded");
/**
 * @typedef {Object} Player
 * @property {string} username
 * @property {string} discriminator
 * @property {string} avatar
 * @property {string} uid
 * @property {string} socketId
 * @property {number} x
 * @property {number} y
 */
/**
 * 
 * @param {Player} player 
 */

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");

let lastUpdate = Date.now();
function updatePlayers(players) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!window.Terrain || !window.Terrain.image) {
        return error("Waiting for terrain...")
    }
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    let playerSize = 30;
    ctx.lineWidth = 5;

    let cameraX, cameraY;
    const localPlayer = players.find(player => player.socketId === socket.id);
    if (localPlayer) {
        cameraX = localPlayer.x - canvas.width / 2;
        cameraY = localPlayer.y - canvas.height / 2;
    }


    window.Terrain.draw(ctx, cameraX, cameraY);
    for (let player of players) {
        ctx.beginPath();
        ctx.arc(player.x - cameraX, player.y - cameraY, playerSize, 0, 2 * Math.PI);
        if (player.socketId === socket.id) ctx.fillStyle = "aqua";
        else ctx.fillStyle = "red";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(player.username, player.x - cameraX, player.y - cameraY - playerSize - 5, 150);
        ctx.fill();
        ctx.stroke();
    }

    // execute every 2 seconds
    if (Date.now() - lastUpdate > 2000) {
        lastUpdate = Date.now();
        updateUi(localPlayer);
        updateLeaderboard(players);
    }

    
}


