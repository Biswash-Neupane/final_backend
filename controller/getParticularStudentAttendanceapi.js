const ClassModel = require("../models/ClassModel");

exports.getStudentAttendanceByName = async (req, res) => {
  const studentName = req.params.studentName;
  const searchPattern = new RegExp(studentName, "i"); // Case-insensitive regex search

  try {
    const attendanceRecords = await ClassModel.aggregate([
      {
        $match: {
          $or: [
            { "Sections.A.StudentName": { $regex: searchPattern } },
            { "Sections.B.StudentName": { $regex: searchPattern } },
          ],
        },
      },
      {
        $project: {
          ClassName: 1,
          section: {
            $cond: {
              if: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: "$Sections.A",
                      as: "section",
                      in: {
                        $regexMatch: {
                          input: "$$section.StudentName",
                          regex: searchPattern,
                        },
                      },
                    },
                  },
                  0,
                ],
              },
              then: "A",
              else: "B",
            },
          },
          sections: { $concatArrays: ["$Sections.A", "$Sections.B"] },
        },
      },
      { $unwind: "$sections" },
      { $match: { "sections.StudentName": { $regex: searchPattern } } },
      { $unwind: "$sections.Attendance" },
      {
        $group: {
          _id: "$sections.StudentName",
          ClassName: { $first: "$ClassName" },
          Section: { $first: "$section" },
          PresentCount: {
            $sum: {
              $cond: [
                { $eq: ["$sections.Attendance.status", "present"] },
                1,
                0,
              ],
            },
          },
          AbsentCount: {
            $sum: {
              $cond: [{ $eq: ["$sections.Attendance.status", "absent"] }, 1, 0],
            },
          },
          OnLeaveCount: {
            $sum: {
              $cond: [
                { $eq: ["$sections.Attendance.status", "on leave"] },
                1,
                0,
              ],
            },
          },
          AttendanceDetails: { $push: "$sections.Attendance" },
        },
      },
      {
        $project: {
          _id: 0,
          "Student Info": {
            Name: "$_id",
            Class: "$ClassName",
            Section: "$Section",
          },
          Counts: {
            "Present Count": "$PresentCount",
            "Absent Count": "$AbsentCount",
            "On Leave": "$OnLeaveCount",
          },
          Data: {
            $map: {
              input: "$AttendanceDetails",
              as: "attendance",
              in: {
                Date: "$$attendance.date",
                Status: "$$attendance.status",
                Time: "$$attendance.time",
              },
            },
          },
        },
      },
    ]);

    if (attendanceRecords.length > 0) {
      res.json(attendanceRecords[0]);
    } else {
      res.json({
        message: "No attendance records found for the specified student.",
      });
    }
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).send("Error fetching attendance records");
  }
};
