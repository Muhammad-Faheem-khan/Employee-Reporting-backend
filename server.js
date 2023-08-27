require('dotenv').config();
const socketIo = require('socket.io');

const app = require('./app')
const http = require('http').Server(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('sendNotification', (notification) => {
    socket.broadcast.emit('newNotification', notification);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const port = process.env.PORT || 5000;
http.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
