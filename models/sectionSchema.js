const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const studentSchema = require("./studentSchema"); // Adjust the path as necessary

// Assuming a structure where "Sections" is an array of students.
// If sections are named or structured differently, adjust accordingly.
const sectionSchema = new Schema(
  {
    A: [studentSchema],
    B: [studentSchema],
  },
  { _id: false }
); // This will prevent MongoDB from adding an _id field to each section

module.exports = sectionSchema;
