const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const sectionSchema = require("./sectionSchema");

const classSchema = new Schema({
  _id: Schema.Types.ObjectId, // MongoDB automatically generates this, but defining for clarity
  ClassName: String,
  Sections: sectionSchema, // Adjust based on actual section structure
});

module.exports = classSchema;
