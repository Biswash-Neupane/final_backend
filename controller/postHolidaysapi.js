// Assuming the SchoolModel is correctly set up as discussed earlier
const SchoolModel = require("../models/schoolModel"); // Update the path according to your project structure

exports.markHoliday = async (req, res) => {
  const { date } = req.body; // Extract the date from the request body

  // console.log("Date received:", date);

  // Validate the incoming date
  if (!date) {
    return res.status(400).send("Date is required");
  }

  try {
    // Assuming there's a unique identifier (like SchoolID) to find the correct school document
    const result = await SchoolModel.updateOne(
      { SchoolID: 1234 }, // Use the actual identifier for your school document
      { $addToSet: { Holidays: date } } // This adds the date to Holidays if it's not already present
    );

    // Inside the try block, after the updateOne operation
    // console.log("Update result:", result);
    // If no document is found or modified, it means the school document doesn't exist
    if (result.matchedCount === 0) {
      return res.status(404).send("School not found");
    }

    if (result.modifiedCount === 0) {
      // The date was already in the Holidays array
      return res.status(409).send("Date already marked as a holiday");
    }

    res.status(200).send("Holiday marked successfully");
  } catch (error) {
    console.error("Error marking holiday:", error);
    res.status(500).send("Server error while marking holiday");
  }
};
