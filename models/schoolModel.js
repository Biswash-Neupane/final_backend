const mongoose = require("mongoose");
const schoolSchema = require("./schoolSchema");

const SchoolModel = mongoose.model("School", schoolSchema, "test_school"); // Assuming "test_school" is your collection name

module.exports = SchoolModel;
