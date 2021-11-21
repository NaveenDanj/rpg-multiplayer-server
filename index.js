let express = require("express");
var cors = require('cors')

const app = express()
app.set("port", process.env.PORT || 9001)

app.use(cors())

let http = require("http").Server(app)
let io = require("socket.io")(http , {
    cors: {
      origin: "http://localhost:8000",
      methods: ["GET", "POST"]
    }
});

app.get("/", (req, res) => {
  res.send('Hello Server!');
})

io.on("connection", async function(socket) {
  
  console.log("Client connected!");
  socket.join('room');
  //send user socket id
  let playerX = Math.random()*780;
  let playerY = Math.random()*600;

  socket.playerX = playerX;
  socket.playerY = playerY;

  socket.emit('socketConfirmation' , {
    id : socket.id,
    x : playerX,
    y : playerY
  });
  //send new user connected to the room
  socket.broadcast.to("room").emit("newUser" , socket.id);
  

  //on user disconnect
  socket.on('disconnect' , (r) => {
    console.log('user has disconnected' , r);
    socket.broadcast.to("room").emit("userDisconnected" , socket.id);
  })

  socket.on('getAllUsers' , (_arg) => {
    const allSockets = io.sockets.adapter.rooms.get('room');
    let sockList = [];

    console.log('sock object' , allSockets)
  
    for (const clientId of allSockets ) {
      if(clientId != socket.id){
        sockList.push(clientId);
      }
    }
  
    console.log('user list : ' , sockList);
  
    socket.emit("allUsers" , sockList);
  
  })



  //handle player movements

  socket.on('playerMoved' , args => {
    socket.to('room').emit('playerMoved' , args);
  });


  //handle player idle event
  socket.on('playerIdle' , args => {
    socket.to('room').emit('playerIdle' , args);
  });


})

http.listen(9001, function() {
  console.log("listening on *:9001")
})