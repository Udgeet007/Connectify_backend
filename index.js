const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 8990;
const cors = require('cors');
require('dotenv').config();

const connection = require('./db'); //connectToDB ... function
connection();
let userRouter = require('./routes/userRoutes');
let postRouter = require('./routes/postRoutes');
let messageRouter = require('./routes/messageRoutes');

app.use(cors());
app.use(express.json({limit: '100mb'}));

app.set('view engine', 'ejs');

let users = new Map();

const addUserData = (id, socketId) =>{
    users.set(id,socketId)
  console.log(users);
}
 //jab event ko listen krna ho to .on use karte hae.  jab bejhna ho to .emit
io.on('connection',(socket)=>{
  // console.log('user connected', socket.id);

  socket.on('addUser', (userId)=>{
    // console.log("userId = ", userId, socket.id); 
    addUserData(userId, socket.id)
  })

  socket.on('sendMessage',({userId, friendId, message})=>{
    console.log({userId, friendId, message});

    let findFriend = users.has(friendId);
    // console.log(findFriend);
    let userSocketId = users.get(friendId);
    console.log(userSocketId);
      io.to(userSocketId).emit('getMessage', {userId, friendId, message})
  })

});


app.get('/',(req,res)=>{
  res.send('Har Har Mahadev!')
});

app.use('/api/users',userRouter);
app.use('/api/posts', postRouter);
app.use('/api/message', messageRouter);
// http://localhost/3000/api/users/userRouter

server.listen(port, ()=>{
  console.log(`Server is running on port:${port}`);
})