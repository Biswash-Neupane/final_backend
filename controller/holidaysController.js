// holidaysController.js
const SchoolInfoModel = require("../models/schoolInfoModel"); // Update the path according to your project structure

exports.getHolidays = async (req, res) => {
  try {
    // Example using SchoolID; adjust the value accordingly to match your document
    const schoolInfo = await SchoolInfoModel.findOne({ SchoolID: 1234 });
    if (!schoolInfo) {
      return res.status(404).json({ message: "School information not found" });
    }
    res.json({ holidays: schoolInfo.Holidays });
  } catch (error) {
    console.error("Error fetching holiday information:", error);
    res.status(500).send("Server error while fetching holiday information");
  }
};
