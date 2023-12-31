const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors')
const connectDB = require("./config/db");
const {chats} = require("./data/data");
const userRoutes=require('./routes/userRoutes')
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const {notFound,errorHandler}=require('./middleware/errormiddleware')
dotenv.config();
const port= process.env.PORT ||5000;
// dotenv.config();
connectDB();
const app = express();
app.use(cors())

app.use(express.json());
//  to accept json data

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.get('/api/chat', (req, res) => {
//   res.send(chats)
// })
// app.get('/api/chat/:id', (req, res) => {
// //  console.log(req)
// //  console.log(req.params.id)
// const singleChat= chats.find((c)=> c._id === req.params.id);
// res.send(singleChat)
// })

app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/message',messageRoutes)

app.use(notFound)
app.use(errorHandler);



const server = app.listen(port,
  console.log(`Server running on PORT ${port}...`));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://chat-web-application.netlify.app",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData._id)
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
