function info(msg) {
    console.log(`%c[Log] %c${msg}`, "color: magenta; font-size: 15px;", "color: white; font-size: 13px;")
    return false;
}

function error(msg) {
    console.log(`%c[Error] %c${msg}`, "color: red; font-size: 15px;", "color: lightcoral; font-size: 13px;")
    return false;
}

function success(msg) {
    console.log(`%c[Success] %c${msg}`, "color: green; font-size: 15px;", "color: lightgreen; font-size: 13px;")
    return true;
}

function asset(msg) {
    console.log(`%c[Assets] %c${msg}`, "color: #42e3f5; font-size: 15px;", "color: #4287f5; font-size: 13px;")
    return true;
}

window.Assets = {}
Assets.tree = new Image();
Assets.tree.src = "/img/Tree.png";
Assets.tree.onload = () => {
    asset("Tree loaded")
}
Assets.tree.size = 150;

Assets.rock = new Image();
Assets.rock.src = "/img/Rock.png";
Assets.rock.onload = () => {
    asset("Rock loaded")
}
Assets.rock.size = 100;


window.Constants = {}
Constants.TILE_WIDTH = 50;
Constants.TILE_HEIGHT = 50;


info("Debug script loaded")
