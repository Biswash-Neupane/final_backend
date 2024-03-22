const ClassModel = require("../models/ClassModel"); // Ensure the path is correct

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { Start_Date, End_Date, Student_Name } = req.body;

    const startDate = new Date(Start_Date);
    const endDate = new Date(End_Date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).send({ message: "Invalid date format." });
    }

    // Assuming classes are differentiated and stored in the same collection 'test_school'
    const classes = await ClassModel.find().lean();

    let attendanceDetails = [];
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalOnLeave = 0;

    classes.forEach((cls) => {
      // Ensure cls.Sections is defined and is an object
      if (cls.Sections && typeof cls.Sections === "object") {
        Object.values(cls.Sections).forEach((section) => {
          section.forEach((student) => {
            if (student.StudentName === Student_Name) {
              student.Attendance.forEach((record) => {
                const recordDate = new Date(record.date);
                if (recordDate >= startDate && recordDate <= endDate) {
                  attendanceDetails.push({
                    StudentID: student.StudentID,
                    Date: record.date,
                    AttendanceStatus: record.status,
                    Time: record.status === "absent" ? "0:00" : record.time,
                  });

                  if (record.status === "present") totalPresent++;
                  else if (record.status === "absent") totalAbsent++;
                  else if (record.status === "on leave") totalOnLeave++;
                }
              });
            }
          });
        });
      }
    });

    const summary = {
      "Total Present Counts": totalPresent,
      "Total Absent Counts": totalAbsent,
      "Total On-Leave Counts": totalOnLeave,
    };

    res.status(200).json([summary, attendanceDetails]);
  } catch (error) {
    console.error("Failed to get attendance summary:", error);
    res.status(500).send({ message: "Internal server error." });
  }
};
