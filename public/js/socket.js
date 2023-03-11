info("Socket script loaded")
let socket = null;
let localPlayer = null;
const playerMovement = {
    up: false,
    down: false,
    left: false,
    right: false,
    lookAngle: 0
};

async function getUser() {
    let data = await fetch("/api/v1/user").then(r => r.json());
    if (!data) {
        return error("Failed to fetch user");
    }

    return data;
}

async function getSocket() {
    let user = await getUser();
    if (!user || (user && !user.success)) {
        return false;
    }

    socket = io("/", {
        auth: {
            accessToken: user.data.accessToken,
            refreshToken: user.data.refreshToken,
            id: user.data.id
        }

    });
    return true;
}

(async () => {
    await getSocket();
    if (!socket) {
        return error("Failed to connect socket")
    }

    document.addEventListener("keydown", async (e) => {
        if (e.key.toLowerCase() === "w" && !playerMovement.up) {
            playerMovement.up = true;
            socket.emit("playerMovement", playerMovement);
        }
        else if (e.key.toLowerCase() === "a" && !playerMovement.left) {
            playerMovement.left = true;
            socket.emit("playerMovement", playerMovement);
        }
        else if (e.key.toLowerCase() === "s" && !playerMovement.down) {
            playerMovement.down = true;
            socket.emit("playerMovement", playerMovement);
        }
        else if (e.key.toLowerCase() === "d" && !playerMovement.right) {
            playerMovement.right = true;
            socket.emit("playerMovement", playerMovement);
        }

    })

    // document.body.addEventListener("mousemove", async (e) => {
    //     if (localPlayer) {

    //         socket.emit("playerMovement", angle);
    //     }
    // })

    document.addEventListener("keyup", async (e) => {
        if (e.key.toLowerCase() === "w" && playerMovement.up) {
            playerMovement.up = false;
            socket.emit("playerMovement", playerMovement);
        }
        else if (e.key.toLowerCase() === "a" && playerMovement.left) {
            playerMovement.left = false;
            socket.emit("playerMovement", playerMovement);
        }
        else if (e.key.toLowerCase() === "s" && playerMovement.down) {
            playerMovement.down = false;
            socket.emit("playerMovement", playerMovement);
        }
        else if (e.key.toLowerCase() === "d" && playerMovement.right) {
            playerMovement.right = false;
            socket.emit("playerMovement", playerMovement);
        }

    });

    socket.on("test", async (data) => {
        console.log(data)
    })
    socket.on("spawn", async (data) => {
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer(data);
    });
    socket.on("despawn", async (data) => {
        console.log("despawned", data);
    });
    // for all players
    socket.on("update", async (data) => {
        localPlayer = data.players.find(p => p.socketId === socket.id);
        updatePlayers(data.players);
    });
    // for all players
    socket.on("leaderboard", async (data) => {
        updateLeaderboard(data.players);
    });
    // for only the local player
    socket.on("load", (data) => {
        console.log(data.objects)
        loadTerrain(data.terrain, data.t_start);
    })
    socket.on("ping", time => {
        updateUi(time, localPlayer);
    })
    socket.on("error", async (type, message) => {
        error(`Socket error: ${type} - ${message}`);
    });
    socket.on("moving", async (data) => {
        updatePlayers(data.players);
    });
})()