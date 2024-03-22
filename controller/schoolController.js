// controllers/schoolController.js
const SchoolModel = require("../models/schoolModel");

exports.getSchoolData = async (req, res) => {
  try {
    const schools = await SchoolModel.find(); // SchoolModel is your Mongoose model
    // console.log("Fetched schools data:", schools); // Add this line to log the data
    res.json(schools);
  } catch (error) {
    // console.error("Error fetching schools data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
