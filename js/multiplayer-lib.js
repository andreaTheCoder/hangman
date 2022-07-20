const baseId = "the-andrea-awesome-multiplayer-id-"
const playerNames = ["andrea","sophie","ira","kara","dad","guest"];
const appStateSelectLocalPlayer = "selectLocalPlayer";
const appStateSelectOtherPlayer = "selectOtherPlayer";
const appStateSelectWaitingForConnection = "waiting-for-connecting";
const appStateReady = "ready";
let infoProviderText = document.body.querySelector("#info-provider-text")
let game = document.body.querySelector("#game");

let otherPlayer = null
let peer = null;
let conn = null;
let yourName = '';
const music = new Audio('notification-tone-swift-gesture.mp3')
function setAppStatus(status) {
    game.dataset.appstatus = status;
    infoProviderText = document.body.querySelector(".info-provider-text")
    if(status==="ready"){
        infoProviderText.innerHTML = "Connected to other player! (:"
    }else if(status===appStateSelectOtherPlayer){
        infoProviderText.innerHTML = "Select player you want to connect to"
    }
}
function openMySocketToOtherPlayers(myId) {
    let myIdString = baseId+myId;
    console.log("opening my socket to other players (my id: " + myIdString +")");
    peer = new Peer(myIdString, {
        debug: 2
    });
    // on open will be launch when you successfully connect to PeerServer
    peer.on('open', function() {
    });
    peer.on('error', function(err) {
        console.error('Connection error', err);
    });
    peer.on('connection', function(incomingConn) {
        onConnectionReady(incomingConn);

    });
}
function onConnectionReady(connection) {
    // Need to stop using global conn
        infoProviderText.innerHTML = `Playing Multiplayer Hangman! with ${otherPlayer}`
    conn = connection;
    connection.otherPlayerId = connection.peer.replace(baseId, '');
    let msg = `Connection with ${connection.otherPlayerId} is ready`;
    setAppStatus(appStateReady)
    addToLog(msg);
    connection.on('data', function(data){
        music.play()
        let msg = `${connection.otherPlayerId}: ${data}`;
        console.log(msg);
        addToLog(msg);
    });
    connection.on('close', function(data){
        infoProviderText.innerHTML = `Connection with ${connection.otherPlayerId} is closed`;
        addToLog(msg);
    });
    connection.on('error', function(data){
        infoProviderText.innerHTML = `Connection error ${connection.otherPlayerId} ${err.type}`;
        addToLog(msg);
    });
}
function sendMsg(msg) {
    if (conn) {
        conn.send(msg);
        addToLog(`You: ${msg} `);
    }else{
        addToLog(`Your message: '${msg}' failed to send. Try connecting to another player first.`)
    }
}
function createConnectionWithOtherPlayer(otherPlayerId) {
    const otherPlayer = baseId + otherPlayerId;
    console.log("Connecting to " + otherPlayer)
    let curConn = peer.connect(otherPlayer);
    curConn.on('open', function() {
        onConnectionReady(curConn);
    });
    
    
}
function addToLog(message){
    let node = document.createElement("div");
    node.innerHTML = message;
    let history = document.body.querySelector("#history");
    history.appendChild(node);
    history.scrollTop = history.scrollHeight;
}

function clickHandler(e){
    let action = e.target.dataset.action
    if(action==="getPlayerName"){
        yourName = e.target.dataset.name;
        openMySocketToOtherPlayers(yourName);
        setAppStatus(appStateSelectOtherPlayer);
        if(yourName==="Andrea"){
            addToLog("Welcome Andrea! You are the best! (whoever coded this is awesome)")
            
        }else{
            addToLog("Hello "+ yourName+"!");
        }
    }else if(action==="send-msg"){
        let inputMsg = document.body.querySelector("#input-msg");
        msg=inputMsg.value;
        sendMsg(msg);
        inputMsg.value = '';
    } else if (action == 'getOtherPlayerName') {
        createConnectionWithOtherPlayer(e.target.dataset.name);
        infoProviderText.innerHTML = `Connecting with ${e.target.dataset.name}`
    }
    
}


function initGame(){
    game.addEventListener('click', clickHandler);
}   
initGame()
//fix hiding problem