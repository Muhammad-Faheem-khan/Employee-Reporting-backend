const express = require('express');
const app = express()
const mongoose = require('mongoose')
const bodyParser = require("body-parser");
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

const userRoutes = require('./routes/userRoutes')
const announcementRoutes = require('./routes/announcementRoutes')
const taskRoutes =  require('./routes/taskRoutes')
const notificationRoutes = require('./routes/notificationRoutes')

const cors = require('cors'); 

const mongoURI = process.env.MONGODB_URI;
app.use(bodyParser.json()); //application/json
app.use(cors());
app.use('/api/users', userRoutes)
app.use('/api/announcement',  announcementRoutes)
app.use('/api/task',  taskRoutes)
app.use('/api/notifications', notificationRoutes)

app.use("/uploads", express.static("uploads"));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Example: Emitting a notification to all connected clients
  socket.on('sendNotification', (notification) => {
    socket.broadcast.emit('newNotification', notification);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

async function connectToMongoDB() {
    try {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Failed to connect to MongoDB Atlas:', error.message);
        // Retry after a delay
        setTimeout(connectToMongoDB, process.env.PORT); // Retry after 5 seconds
    }
  }
  
  connectToMongoDB();

module.exports = app;