const mongoose = require("mongoose");
const studentSchema = require("./studentSchema"); // Ensure the path is correct

// Explicitly specify the collection name as "School1"
const Student = mongoose.model("Student", studentSchema, "test_school");
module.exports = Student;
