const baseId = "cool-andrea-awesome-multiplayer-id-technoblade-"
const appStateSelectLocalPlayer = "selectLocalPlayer";
const appStateSelectOtherPlayer = "selectOtherPlayer";
const appStateWaitingForConnection = "waitingForConnection";
const appStateSelectPlayerType = "selectPlayerType";
const playingGame = "playingGame";
let infoProviderText = document.body.querySelector("#info-provider-text")
let game = document.body.querySelector("#game");
let otherPlayerPickedType = false
let youPickedPlayerType = false
let playerType = "fghjk"

let peer = null;
let conn = null;
let yourName = '';
let obj = {}
const music = new Audio('notification-tone-swift-gesture.mp3')
const ding = new Audio('ding-sound-effect_2.mp3')
function changeText(text){
    infoProviderText.innerHTML = text
}
function startGame(){
    addToLog("The game has started")
}
function setAppStatus(status,playerName) {
    game.dataset.appstatus = status;
    infoProviderText = document.body.querySelector(".info-provider-text")
    if(status==="selectPlayerType"){
        infoProviderText.innerHTML = `Pick who you want to be! :)`
    }else if(status===appStateSelectOtherPlayer){
        changeText("Select player you want to connect to")
    }
    console.log(`your status is : ${status}`)
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
    ding.play()
    conn = connection;
    connection.otherPlayerId = connection.peer.replace(baseId, '');
    console.log(`connected with ${connection.otherPlayerId}`)
    let msg = `Connection with ${connection.otherPlayerId} is ready`;
    setAppStatus(appStateSelectPlayerType,connection.otherPlayerId)
    addToLog(msg);
    connection.on('data', function(data){
        music.play();
        let obj = JSON.parse(data);
        let msgType = obj?.type;
        let info = obj.data
        if(msgType === "msg"){
            let msg = `${connection.otherPlayerId}: ${info}`;
            addToLog(msg);
        }else if(msgType==="otherPlayerType"){
         otherPlayerPickedType = true
            if(info==="guesser"){
                curPlayerGuesser = document.body.querySelector("#curPlayerGuesser")
                curPlayerGuesser.innerHTML = connection.otherPlayerId
            }else if(info==="wordPicker"){
                curPlayerWordPicker = document.body.querySelector("#curPlayerWordPicker")
                curPlayerWordPicker.innerHTML = connection.otherPlayerId
            }
        }
        console.log(msg);
    });
    connection.on('close', function(data){
        msg = `Connection with ${connection.otherPlayerId} is closed`;
        changeText(msg)
        addToLog(msg);
    });
    connection.on('error', function(data){
        msg = `Connection error ${connection.otherPlayerId} ${err.type}`;
        changeText(msg)
        addToLog(msg);
    });
}
function sendMsg(msg) {
    if (conn) {
        addToLog(`You are a ${msg.data}! `);
        conn.send(JSON.stringify(msg));
    }else{
        addToLog(`Your message: '${msg}' failed to send. Try connecting to another player first.`)
    }
}
function createConnectionWithOtherPlayer(otherPlayerId) {
    setAppStatus(appStateWaitingForConnection,"ohok")
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
        setAppStatus(appStateSelectOtherPlayer,"name");
        if(yourName==="Andrea"){
            addToLog("Welcome Andrea! You are the best! (whoever coded this is awesome)")
            
        }else{
            addToLog("Hello "+ yourName+"!");
        }
    }else if(action==="send-msg"){
         obj = {}
        let inputMsg = document.body.querySelector("#input-msg");
        msg=inputMsg.value;
        obj.data = msg
        obj.type = "msg"
        sendMsg(obj);
        inputMsg.value = '';
    } else if (action == 'getOtherPlayerName') {
        createConnectionWithOtherPlayer(e.target.dataset.name);
        msg = `Connecting with ${e.target.dataset.name}`
        changeText(msg)
    }else if(action==="selectPlayerType"){
        youPickedPlayerType = true
       playerType = e.target.dataset.playertype 
        if(playerType==="Guesser"){
            curGuesserPlayerTag = document.body.querySelector("#curPlayerGuesser")
            curGuesserPlayerTag.innerHTML = yourName
            obj = {}
            obj.data=`guesser`
            obj.type = 'otherPlayerType'
            sendMsg(obj)
        }else if(playerType==="WordPicker"){
            curWordPickerPlayerTag = document.body.querySelector("#curPlayerWordPicker")
            curWordPickerPlayerTag.innerHTML = yourName
            obj = {}
            obj.data=`wordPicker`
            obj.type = 'otherPlayerType'
            sendMsg(obj)
        }
    }else if(action==="startGame"){
        if(classlist.game==="ready"){
            startGame()
        }else{
            addToLog("Try picking who you want to be before you start the game")
        }
    }
    
}


function initGame(){
    game.addEventListener('click', clickHandler);
}   
initGame()
//fix hiding problem