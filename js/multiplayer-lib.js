const baseId = "cool-andrea-awesome-multiplayer-id-technoblade-"
const appStateSelectLocalPlayer = "selectLocalPlayer";
const appStateSelectOtherPlayer = "selectOtherPlayer";
const appStateWaitingForConnection = "waitingForConnection";
const appStateSelectPlayerType = "selectPlayerType";
const appStatePickingWord = "pickingWord"
const playingGame = "playingGame";
let appStateReady = "ready"
let readyToStartGame = false
let otherPlayerReady = false
let infoProviderText = document.body.querySelector("#info-provider-text")
let game = document.body.querySelector("#game");
let oppenentPlayerType = false
let playerType = ""
let yourName = ""
let alreadyPickedType = false
let peer = null;
let conn = null;
let obj = {}
const music = new Audio('notification-tone-swift-gesture.mp3')
const ding = new Audio('ding-sound-effect_2.mp3')
function changeText(text){
    infoProviderText.innerHTML = text
}
function startGame(){
    addToLog("The game has started")
    if(playerType==="guesser"){
        changeText("Waiting for oppenent to pick word")
    }else{
        changeText("Pick your word")
    }
    changeText("Enjoy playing this hangman game! (;")
    setAppStatus(appStatePickingWord)
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
        console.log('Connection error');
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
        let obj = JSON.parse(data);
        let msgType = obj?.type;
        let info = obj.data
        if(msgType === "msg"){
            music.play();
            let msg = `${connection.otherPlayerId}: ${info}`;
            addToLog(msg);
        }else if(msgType==="otherPlayerType"){
         oppenentPlayerType = info   
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
        msg = `Connection error ${connection.otherPlayerId}`;
        addToLog("An error has occured. Try refreshing the page.")
        changeText(msg)
        addToLog(msg);
    });
}
function sendMsg(msg) {
    conn.send(JSON.stringify(msg))
    if (conn) {
        if(msg.type==="msg"){
            addToLog(`You: ${msg.data}`);
        }else if(msg.type==="otherPlayerType"){
            addToLog(`You are a ${msg.data}! `);
        }else{
            addToLog(`Your message: '${msg}' failed to send. Try connecting to another player first.`)
    }
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
        readyToStartGame = true

       playerType = e.target.dataset.playertype 
       if(alreadyPickedType==!true){
        alreadyPickedType = true
        if(playerType==="guesser"){
            curGuesserPlayerTag = document.body.querySelector("#curPlayerGuesser")
            curGuesserPlayerTag.innerHTML = yourName
            obj = {}
            obj.data=`guesser`
            obj.type = 'otherPlayerType'
            sendMsg(obj)
        }else if(playerType==="wordPicker"){
            curWordPickerPlayerTag = document.body.querySelector("#curPlayerWordPicker")
            curWordPickerPlayerTag.innerHTML = yourName
            obj = {}
            obj.data=`word picker`
            obj.type = 'otherPlayerType'
            sendMsg(obj)
        }
    }else{
        addToLog("You can't be both jobs at once. Sorry not sorry")
    }
}else if(action==="startGame"){
        if(playerType!==oppenentPlayerType&&(playerType!==""&&oppenentPlayerType!=="")){
            startGame()
        }else{
            addToLog("Try picking who you want to be before you start the game")
        }
    }
    
}
function hi(e){
    if(e.charCode===13){
        obj = {}
        let inputMsg = document.body.querySelector("#input-msg");
        msg=inputMsg.value;
        obj.data = msg
        obj.type = "msg"
        inputMsg.value = '';
        if (conn) {
            addToLog(`You : ${obj.data}! `);
            conn.send(JSON.stringify(obj));
        }else{
            addToLog(`Your message: '${msg}' failed to send. Try connecting to another player first.`)
        }
    }
}
function initGame(){
    game.addEventListener('click', clickHandler);
    game.addEventListener('keypress',hi)
}   
initGame()
//fix hiding problem