const mongoose = require("mongoose");
const classSchema = require("./classSchema.js"); // Ensure the path is correct

const ClassModel = mongoose.model("Class", classSchema, "test_school"); // Assuming "test_school" is your collection name

module.exports = ClassModel;
