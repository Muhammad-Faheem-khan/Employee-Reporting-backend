const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
      },

      email: {
        type: String,
        required: true,
        unique: true
      },

      password: {
        type: String,
        required: true
      },

      departmentName: {
        type: String,
        default: null,
      },

      designation: {
        type: String,
        default: null,
      },

      jobDescription: {
        type: String,
        default: null,
      },

      employeeReportingTo: {
        type: ObjectId,
        ref: 'User',
        default: null,
      },

      employeeStatus: {
        type: String,
        default: null,
      },

      salary: {
        type: String,
        default: null,
      },

      joiningDate: {
        type: String,
        default: null
      },

      gender: {
        type: String,
        default: null,
      },

      dob: {
        type: String,
        default: null,
      },

      employeeCode: {
        type: String,
        default: null,
      },

      cnic: {
        type: String,
        default: null,
      },

      mobilePersonal: {
        type: String,
        default: null,
      },

      mobileCompany: {
        type: String,
        default: null,
      },

      address: {
        type: String,
        default: null,
      },

      isActive: {
        type: Boolean,
        default: true
      },

      role: {
        type: String,
        required: true,
        default: 'Employee',
      },
      
      createdAt: {
        type: Date,
        default: Date.now
      }
})

const User = mongoose.model('User', userSchema)

module.exports = User;