const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
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
    Holidays: {
      type: [String], // Array of strings to store dates
      required: true,
    },
    StartingTime: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // `timestamps` adds `createdAt` and `updatedAt` fields
    collection: "test_school", // Explicitly specifying the collection name
  }
);

const TestSchool = mongoose.model("TestSchool", schoolSchema, "test_school");

module.exports = TestSchool;
