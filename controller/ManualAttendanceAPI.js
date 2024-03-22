const StudentModel = require("../models/StudentModel"); // Update path as necessary

// This function assumes you're sending a JSON body with the structure
// { "studentName": "Rabin Basyal", "classSelection": "1", "sectionSelection": "A", "selectedDate": "2080-11-28" }
const appendAttendanceRecords = async (req, res) => {
  const { studentName, classSelection, sectionSelection, selectedDate } =
    req.body;

  try {
    // Fetch the class based on ClassName (assuming classSelection is ClassName)
    // and the specific student within the section
    const targetClass = await StudentModel.findOne({
      ClassName: classSelection,
      [`Sections.${sectionSelection}.StudentName`]: studentName,
    });

    if (!targetClass) {
      return res.status(404).send("Class or student not found.");
    }

    // Append the attendance record
    const studentIndex = targetClass.Sections[sectionSelection].findIndex(
      (student) => student.StudentName === studentName
    );
    if (studentIndex === -1) {
      return res.status(404).send("Student not found in section.");
    }

    targetClass.Sections[sectionSelection][studentIndex].Attendance.push({
      date: selectedDate,
      time: "10:00:00 AM", // Default time as specified
      status: "present", // Assuming you want to mark them present; adjust as needed
    });

    await targetClass.save();
    res.send("Attendance record appended successfully.");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while appending attendance records.");
  }
};

module.exports = { appendAttendanceRecords };
