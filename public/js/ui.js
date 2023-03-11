let palyersDiv = document.createElement("div");
let uiDiv = document.createElement("div");
let consoleDiv = document.createElement("div");
uiDiv.id = "ui";
palyersDiv.id = "players";
consoleDiv.id = "console";
document.body.appendChild(palyersDiv);
document.body.appendChild(uiDiv);
document.body.appendChild(consoleDiv);
function updateLeaderboard(players) {
    let html = "";
    for(let player of players) {
        html += `<div class="player">
            <div class="header">
                <img src="${player.avatar
                ? `https://cdn.discordapp.com/avatars/${player.uid}/${player.avatar}.png`
                : "https://static.vecteezy.com/system/resources/previews/006/892/625/non_2x/discord-logo-icon-editorial-free-vector.jpg" }">
                <span class="name">${player.username}</span>
            </div>
            <div class="footer">
            <span class="score">${0}</span>
            </div>
            
        </div>`
    }
    palyersDiv.innerHTML = html;
}

function updateUi(player) {
    let ping = player.ping ? Date.now() - player.ping : 0;
    uiDiv.innerHTML = `
    <div class="container"><span class="ping">Ping ${ping ? ping.toFixed(0) + "ms" : "loading"}</span></div>
    <div class="container"><span class="coords">X/Y ${player.x.toFixed(1)} / ${player.y.toFixed(1)}</span></div>
    `;
}

function drawConsole() {
    //<button onclick="sendCommand()">Send</button>
    consoleDiv.innerHTML = `
    <input id="command" type="text" placeholder="Command">
    `;
    consoleDiv.style.display = "block";
    document.getElementById("command").focus();
}

function hideConsole() {
    consoleDiv.innerHTML = "";
    consoleDiv.style.display = "none";
}

function sendCommand() {
    let command = document.getElementById("command").value;
    socket.emit("command", command);
    hideConsole();
}

function isConsoleOpen() {
    return consoleDiv.innerHTML !== "";
}

window.onkeydown = async (e) => {
    if(e.key === "`") {
        e.preventDefault();
        drawConsole();
    }
    if(isConsoleOpen() && e.key === "Escape") {
        hideConsole();
    }
    if(isConsoleOpen() && e.key === "Enter" && document.getElementById("command").value !== "") {
        sendCommand();
    }
}
