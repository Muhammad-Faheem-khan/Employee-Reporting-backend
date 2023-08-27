const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema({
   
    description: {
    type: String,
    required: true,
    },
    
    img: {
    type: String,
    default: null
    },
    announcer: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },

    createdAt: {
    type: Date,
    default: Date.now
    }
})

const Announcement = mongoose.model('Announcement', announcementSchema)

module.exports = Announcement;