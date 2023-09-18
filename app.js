const express = require('express');
const app = express()
const mongoose = require('mongoose')
const bodyParser = require("body-parser");

const userRoutes = require('./routes/userRoutes')
const announcementRoutes = require('./routes/announcementRoutes')
const taskRoutes =  require('./routes/taskRoutes')
const notificationRoutes = require('./routes/notificationRoutes') 

const cors = require('cors');  

const mongoURI = process.env.MONGODB_URI;
app.use(bodyParser.json()); //application/json
const allowedOrigins = ['http://localhost:8080', 'https://nbmanagementsystem.com/'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));


app.use('/api/users', userRoutes)
app.use('/api/announcement',  announcementRoutes)
app.use('/api/task',  taskRoutes)
app.use('/api/notifications', notificationRoutes)

app.use("/uploads", express.static("uploads"));

async function connectToMongoDB() {
    try {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Failed to connect to MongoDB Atlas:', error.message);
        
        setTimeout(connectToMongoDB, process.env.PORT); // Retry after 5 seconds
    }
  }
  
  connectToMongoDB();

module.exports = app;