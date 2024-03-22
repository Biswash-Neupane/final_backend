const StudentModel = require("../models/StudentModel");

exports.linegraphdata = async (req, res) => {
  const type = req.params.type; // Get the summary type from URL
  let startDate, endDate;
  const currentDate = new Date();

  // Set the date range based on the type parameter
  switch (type) {
    case "daily":
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 1
      );
      endDate = startDate;
      break;
    case "weekly":
    case "weekly":
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 7
      );
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 1
      );
      break;
    case "monthly":
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        currentDate.getDate()
      );
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 1
      );
      break;
    default:
      return res.status(400).send("Invalid summary type");
  }

  try {
    const aggregateAttendance = async (startDate, endDate) => {
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      return await StudentModel.aggregate([
        {
          $project: {
            ClassName: 1,
            Sections: { $objectToArray: "$Sections" },
          },
        },
        { $unwind: "$Sections" },
        { $unwind: "$Sections.v" },
        { $unwind: "$Sections.v.Attendance" },
        {
          $match: {
            "Sections.v.Attendance.date": {
              $gte: formattedStartDate,
              $lte: formattedEndDate,
            },
          },
        },
        {
          $group: {
            _id: "$Sections.v.Attendance.status",
            count: { $sum: 1 },
          },
        },
      ]);
    };

    const attendanceData = await aggregateAttendance(startDate, endDate);

    const formattedAttendanceData = attendanceData.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      { present: 0, absent: 0, onLeave: 0 }
    );

    res.json(formattedAttendanceData);
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    res.status(500).send("Server error while fetching attendance summary");
  }
};
