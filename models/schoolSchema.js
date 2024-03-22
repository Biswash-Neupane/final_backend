const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  SchoolName: {
    type: String,
    required: true,
  },
  UserName: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  TotalStudents: {
    type: Number,
    required: true,
  },
  TotalStaffs: {
    type: Number,
    required: true,
  },
  ClosingTime: {
    type: String,
    required: true,
  },
  TotalRooms: {
    type: Number,
    required: true,
  },
  SchoolID: {
    type: Number,
    required: true,
  },
});

module.exports = schoolSchema;
