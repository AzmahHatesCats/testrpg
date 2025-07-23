const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const GameMode = require('./GameMode.js');
const FreeForAll = require('./FreeForAll.js');

app.use(express.static(__dirname));

const players = {};
const gameMode = new FreeForAll();

io.on('connection', (socket) => {
  console.log('a user connected');
  players[socket.id] = {
    position: { x: 0, y: 1.8, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    health: 100,
    kills: 0,
    deaths: 0
  };
  gameMode.onPlayerSpawn(players[socket.id]);

  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete players[socket.id];
    io.emit('player disconnected', socket.id);
  });

  socket.on('player update', (data) => {
    players[socket.id] = data;
    socket.broadcast.emit('player update', { id: socket.id, data: players[socket.id] });
  });

  socket.on('shoot', (data) => {
    socket.broadcast.emit('shoot', { id: socket.id, data: data });
  });

  io.emit('current players', players);
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
