const ClassModel = require("../models/ClassModel.js"); // Adjust the path as necessary

exports.findStudentByIdAndLogName = async (studentId) => {
  try {
    // Search for the class containing the student with the given ID
    // Assuming student IDs are unique across the entire collection
    const result = await ClassModel.findOne(
      { "Sections.A.StudentID": studentId },
      { "Sections.A.$": 1 }
    );

    if (result && result.Sections && result.Sections.A.length > 0) {
      // Log the name of the student
      console.log(`Student Name: ${result.Sections.A[0].StudentName}`);
    } else {
      console.log("Student not found.");
    }
  } catch (error) {
    console.error("Error searching for student:", error);
  }
};
