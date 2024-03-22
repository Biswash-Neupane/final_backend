const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceRecordSchema = new Schema(
  {
    date: String,
    time: String,
    status: String,
  },
  { _id: false }
);

module.exports = attendanceRecordSchema;
