const ClassModel = require("../models/ClassModel"); // Adjust path as needed

// Controller function to get attendance records within a date range for a specific class and section
const getAttendanceRecords = async (req, res) => {
  try {
    const { ClassName, SectionName, StartDate, EndDate } = req.body;

    // Convert dates to Date objects for comparison
    const startDate = new Date(StartDate);
    const endDate = new Date(EndDate);

    // Find the specific class
    const classData = await ClassModel.findOne({ ClassName }).lean();
    if (!classData) {
      return res.status(404).send({ message: "Class not found." });
    }

    // Access the specific section
    const section = classData.Sections[SectionName];
    if (!section) {
      return res.status(404).send({ message: "Section not found." });
    }

    // Filter students' attendance records within the date range
    const studentsAttendance = section.map((student) => ({
      StudentID: student.StudentID,
      StudentName: student.StudentName,
      Attendance: student.Attendance.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      }),
    }));

    res.status(200).json(studentsAttendance);
  } catch (error) {
    console.error("Failed to get attendance records:", error);
    res.status(500).send({ message: "Internal server error." });
  }
};

module.exports = { getAttendanceRecords };
