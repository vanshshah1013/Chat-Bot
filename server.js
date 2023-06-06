const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const createAdapter = require("@socket.io/redis-adapter").createAdapter;
require("dotenv").config();
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getcommunityUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const botName = "Let's chat";

// Run when client connects
io.on("connection", (socket) => {
  console.log(io.of("/").adapter);
  socket.on("joincommunity", ({ username, community }) => {
    const user = userJoin(socket.id, username, community);

    socket.join(user.community);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to Let's Chat!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.community)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and community info
    io.to(user.community).emit("communityUsers", {
      community: user.community,
      users: getcommunityUsers(user.community),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.community).emit("message", formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.community).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and community info
      io.to(user.community).emit("communityUsers", {
        community: user.community,
        users: getcommunityUsers(user.community),
      });
    }
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () =>
  console.log(`Chat side server is listening at ${PORT}`)
);
