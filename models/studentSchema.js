const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const attendanceRecordSchema = require("./attendanceRecordSchema");

const studentSchema = new Schema({
  StudentID: String,
  StudentName: String,
  Attendance: [attendanceRecordSchema],
});

module.exports = studentSchema;
