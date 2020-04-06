'use strict';
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/robots.txt', (req, res) => {
  res.sendFile(__dirname + '/robots.txt');
});


app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const rooms = {};

const debug = 0;

io.on('connection', socket => {
  if (debug) console.log('a user connected', socket.id);
  socket.on('room', ({room, defaultRoom}) => {
    if (debug) console.log('room', socket.id, room);
    socket.join(room);
    if (!rooms[room]) rooms[room] = defaultRoom;
    socket.emit('state change', rooms[room]);
  });
  socket.on('name change', name => {
    if (debug) console.log('name', name);
    for (const room in socket.rooms) {
      if (!rooms[room]) continue;
      const players = rooms[room].players
      const player = players[socket.id] || {};
      players[socket.id] = player;
      player.name = name;
      io.to(room).emit('state change', rooms[room]);
    }
  })
  socket.on('mutate state', ({roomId, mutations}) => {
    const room = rooms[roomId];
    const backup = JSON.parse(JSON.stringify(room));
    try {
      for (const mutation of mutations) {
        try {
          if (debug) console.log({mutation});
          let parent = room;
          for (const key of mutation.path || []) {
            parent = parent[key];
          }
          if (mutation.action === 'append') {
            const array = parent[mutation.key] || [];
            parent[mutation.key] = array;
            array.push(mutation.value);
          } else if (mutation.action === 'delete') {
            delete parent[mutation.key];
          } else {
            parent[mutation.key] = mutation.value;
          }
        } catch (e) {
          console.error(`Couldn't run mutation`, JSON.stringify(mutation), e.stack);
          throw e;
        }
      }  
    } catch (e) {
      console.error(`Rolling back to ${JSON.stringify(backup)}`);
      rooms[roomId] = backup;
    }
    
    if (debug) console.log({room});
    io.to(roomId).emit('state change', room);
  })
  socket.on('disconnect', () => {
    if (debug) console.log('user disconnected', socket.id);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (!room) continue;
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        io.to(roomId).emit('user disconnected', {playerId: socket.id, room});
      }
    }
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

const port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log(`listening on http://localhost:${port}/`);
});