const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')

const responseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  },
  description: {
    type: String,
  },
  files: {
    type: [String],
    default: null
    },
});

const taskSchema = new mongoose.Schema({
   
    name: {
    type: String,
    required: true,
    },
    
    assignedToIds: {
    type: [ObjectId],
    required: true,
    },
    assignedToNames:{
      type: [String],
      required: true
    },

    priority: {
    type: String,
    required: true,
    },
    
    status: {
    type: String,
    required: true,
    },

    deadline: {
    type: String,
    required: true,
    },
    description: {
    type: String,
    },
    
    img: {
    type: String,
    default: null
    },

    files: {
    type: [String],
    default: null
    },

    assignedBy: {
    type: ObjectId,
    ref: 'User'
    },

    department: {
    type: String,
    },

    responses: [
      {
        type: responseSchema,
        default: null,
      },
    ],
    
    createdAt: {
    type: Date,
    default: Date.now
    }
})

const task = mongoose.model('Task', taskSchema)

module.exports = task;