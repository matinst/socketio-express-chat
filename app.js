const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

app.use(express.static(path.join(__dirname, "public")));
const io = require("socket.io")(server);

io.on("connection", onConnection);
let socketsConnected = new Set();
function onConnection(socket) {
  socketsConnected.add(socket.id);

  io.emit("client-total", socketsConnected.size);

  socket.on("disconnect", () => {
    console.log("Socket disconnect", socket.id);
    socketsConnected.delete(socket.id);
    io.emit("client-total", socketsConnected.size);
  });

  socket.on("message", (data) => {
    socket.broadcast.emit("chat-message", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });
}
