const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "https://cennectify-frontend.vercel.app", // Replace with your actual frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow credentials like cookies, authorization headers, etc.
  },
});
const port = 8990;
const cors = require('cors');
require('dotenv').config();


const connection = require('./db'); //connectToDB function
connection();

let userRouter = require('./routes/userRoutes');
let postRouter = require('./routes/postRoutes');
let messageRouter = require('./routes/messageRoutes');

// Configure CORS
const allowedOrigins = [
  "https://cennectify-frontend.vercel.app", 
  "http://localhost:5173", // Local development (if needed)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: '100mb' }));
app.set('view engine', 'ejs');

let users = new Map();

const addUserData = (id, socketId) => {
  users.set(id, socketId);
  console.log(users);
};

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('addUser', (userId) => {
    addUserData(userId, socket.id);
  });

  socket.on('sendMessage', ({ userId, friendId, message }) => {
    console.log({ userId, friendId, message });

    let findFriend = users.has(friendId);
    let userSocketId = users.get(friendId);
    console.log(userSocketId);

    if (findFriend) {
      io.to(userSocketId).emit('getMessage', { userId, friendId, message });
    }
  });
});

app.get('/', (req, res) => {
  res.send('Har Har Mahadev!');
});

app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/message', messageRouter);

server.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
