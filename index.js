const express = require("express");
const session = require("express-session");
const http = require("http");
const db = require("./database");
const store = require("connect-mongo");
const passport = require("passport");
const { Server } = require("socket.io");
const axios = require("axios").default;
const { generateTerrain, generateTerrainObjects } = require("./terrain");
require("dotenv").config();

const { User } = require("./database/schema/User");
const { SERVERS, CANVAS_HEIGHT, CANVAS_WIDTH, PLAYER_SPEED, TILE_WIDTH, TILE_HEIGHT } = require("./database/temp");

const app = express();
app
    .use(session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        store: new store(db.connection)
    }))
    .use(express.json())
    .use(express.static("public"))
    .use(passport.initialize())
    .use(passport.session())
    .use("/api/v1", require("./api"))

const server = http.createServer(app);
const io = new Server(server);
server.listen(3000, () => console.log("Server listening: 3000"));

function getClosestTile(terrainData, x, y) {
    let closestTile = null;
    let closestDistance = Infinity;
    for (let i = 0; i < terrainData.length; i++) {
        let t = terrainData[i];
        let distance = Math.sqrt(Math.pow(t.x - x, 2) + Math.pow(t.y - y, 2));
        if (distance < closestDistance) {
            closestDistance = distance;
            closestTile = t;
        }
    }

    return closestTile;
}

for(let server of SERVERS) {
    if(!server.terrain) {
        let start = Date.now();
        let terrain = generateTerrain({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, octaves: 4, persistence: 0.5, lacunarity: 2.0, frequency: 0.05, amplitude: 1.0, seed: Math.random() * 1000 });
        server.objects = generateTerrainObjects(terrain.tiles, { minDistanceBetween: 550 });
        server.terrain = terrain;
        console.log(`Generated terrain for server ${server.name} in ${Date.now() - start}ms`);
    }
}

io.on("connection", async (socket) => {
    let auth = socket.handshake.auth;
    if (!auth.accessToken) {
        return socket.disconnect();
    }

    let { data } = await axios.get("https://discord.com/api/v10/users/@me", {
        headers: {
            Authorization: `Bearer ${auth.accessToken}`
        }
    });

    if (!data) {
        return socket.disconnect();
    }

    // Romanian server
    let server = SERVERS[0];
    if (!server) {
        console.log("Failed to connect server");
        return socket.disconnect();
    }

    let player = {
        socketId: socket.id,
        uid: data.id,
        username: data.username,
        discriminator: data.discriminator,
        avatar: data.avatar,
        settings: {
            speed: PLAYER_SPEED,
        }
    }

    let user = await User.findOne({ uid: data.id });
    if (!user) {
        user = new User({
            uid: data.id,
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
        }).save();
    }

    let userServer = server.players.find(p => p.uid === data.id);
    if (userServer) {
        io.sockets.sockets.get(userServer.socketId)?.emit("despawn", userServer);
        io.sockets.sockets.get(userServer.socketId)?.emit("error", "multipleConnections", "You have been disconnected from the server because you have connected from another device.");
        io.sockets.sockets.get(userServer.socketId)?.disconnect();
    }

    player.x = Math.floor(Math.random() * (CANVAS_WIDTH * TILE_WIDTH - 0) + 0);;
    player.y = Math.floor(Math.random() * (CANVAS_HEIGHT * TILE_HEIGHT - 0) + 0);;

    server.players.push(player);
    player.index = server.players.indexOf(player);
    let t_start = Date.now();

    

    socket.emit("load", { terrain: server.terrain, objects: server.objects, t_start, players: server.players });
    io.sockets.emit("leaderboard", { players: server.players, time_t: Date.now() });
    console.log(`Socket connected: ${data.username} / ${socket.id} | ${server.players.length} / ${server.maxPlayers} players / region: ${server.name}`)

    let lastUpdate = performance.now();
    socket.on("playerMovement", data => {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastUpdate) / 1000;
        lastUpdate = currentTime;

        let player = server.players.find(p => p.socketId === socket.id);
        if (!player) {
            console.log("Move error: player not found");
            return;
        }

        if (!data) {
            console.log("Move error: data not found")
            return;
        }
        player.movement = data;
    })

    socket.on("command", command => {
        let cmd = command.split(" ");
        let player = server.players.find(p => p.socketId === socket.id);
        if (!player) {
            console.log("Command error: player not found");
            return;
        }

        if (!cmd) {
            console.log("Command error: data not found")
            return;
        }

        if (cmd[0] === "tp") {
            let x = parseInt(cmd[1]);
            let y = parseInt(cmd[2]);
            if (x > -1 && y > -1) {
                player.x = x;
                player.y = y;
            }
        }
        else if (cmd[0] === "tpto") {
            let target = server.players.find(p => p.username === cmd[1] || p.socketId === cmd[1] || p.uid === cmd[1]);
            if (target) {
                player.x = target.x;
                player.y = target.y;
            }
        }
        else if (cmd[0] === "tpall") {
            let x = parseInt(cmd[1]);
            let y = parseInt(cmd[2]);
            if (x > -1 && y > -1) {
                server.players.forEach(p => {
                    p.x = x;
                    p.y = y;
                }
                )
            }
        }
        else if (cmd[0] === "tphere") {
            let target = server.players.find(p => p.username === cmd[1] || p.socketId === cmd[1] || p.uid === cmd[1]);
            if (target) {
                target.x = player.x;
                target.y = player.y;
            }
        }
        else if (cmd[0] === "tpallhere") {
            server.players.forEach(p => {
                p.x = player.x;
                p.y = player.y;
            }
            )
        }
        else if (cmd[0] === "speed") {
            if (cmd[1] > 0 && cmd[1] < 5000) {
                player.speed = parseInt(cmd[1]);
            }
        }
        else if (cmd[0] === "speedfor") {
            if (cmd[1] > 0 && cmd[1] < 5000) {
                let target = server.players.find(p => p.username === cmd[2] || p.socketId === cmd[2] || p.uid === cmd[2]);
                if (target) {
                    target.speed = parseInt(cmd[1]);
                }
            }
        }
    })

    socket.on("disconnect", async () => {
        server.players.splice(server.players.indexOf(player), 1);
        io.sockets.emit("leaderboard", { players: server.players, time_t: Date.now() });
        io.sockets.emit("update", { player, server, players: server.players, time_t: Date.now(), disconnected: true });
        console.log(`Socket disconnected: ${data.username} / ${socket.id} | ${server.players.length} / ${server.maxPlayers} players / region: ${server.name}`)
    });
})
let lastUpdate = performance.now();
setInterval(async () => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastUpdate) / 1000;
    lastUpdate = currentTime;

    let server = SERVERS[0];
    for (let player of server.players) {
        if (!player || !player.movement) continue;
        
        player.ping = Date.now();

        let speed = player.speed || PLAYER_SPEED;
        // anti strafe
        if (player.movement.left && player.movement.right) {
            player.movement.left = false;
            player.movement.right = false;
        }
        if (player.movement.up && player.movement.down) {
            player.movement.up = false;
            player.movement.down = false;
        }

        if ((player.movement.right || player.movement.left) && (player.movement.up || player.movement.down)) {
            speed /= 1.5;
        }
        
        let closestTile = null; //getClosestTile(server.terrain?.tiles, player.x, player.y);
        let moveFactor = speed * deltaTime;
        if (player.movement.left && player.x > 0) {
            // detect collision and move in the opposite direction
            if (closestTile && closestTile.x < player.x - moveFactor && closestTile.collision) {
                player.x += moveFactor;
                player.movement.left = false;
            }
            else {
                player.x -= moveFactor;
            }
        }
        else if (player.movement.right && player.x < CANVAS_WIDTH * TILE_WIDTH ) {
            // detect collision and move in the opposite direction
            if (closestTile && closestTile.x > player.x + moveFactor && closestTile.collision) {
                player.x -= moveFactor;
                player.movement.right = false;
            }
            else {
                player.x += moveFactor;
            }
        }
        if (player.movement.up && player.y > 0) {
            // detect collision and move in the opposite direction
            if (closestTile && closestTile.y < player.y - moveFactor && closestTile.collision) {
                player.y += moveFactor;
                player.movement.up = false;
            }
            else {
                player.y -= moveFactor;
            }
        }
        else if (player.movement.down && player.y < CANVAS_HEIGHT * TILE_HEIGHT) {
            // detect collision and move in the opposite direction
            if (closestTile && closestTile.y > player.y + moveFactor && closestTile.collision) {
                player.y -= moveFactor;
                player.movement.down = false;
            }
            else {
                player.y += moveFactor;
            }
        }
    }

    io.sockets.emit("update", { players: server.players, time_t: Date.now(), deltaTime });
}, 1000 / 60) // 60 FPS