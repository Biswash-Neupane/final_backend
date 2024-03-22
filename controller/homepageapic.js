const StudentModel = require("../models/StudentModel");

exports.homechartdata = async (req, res) => {
  let { startDate, endDate } = req.query;
  const currentDate = new Date().toISOString().split("T")[0]; // Format current date as YYYY-MM-DD

  if (!startDate || !endDate) {
    startDate = currentDate;
    endDate = currentDate;
  }

  const currentPeriodStart = new Date(startDate);
  const currentPeriodEnd = new Date(endDate);

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
            _id: {
              ClassName: "$ClassName",
              Section: "$Sections.k",
              Status: "$Sections.v.Attendance.status",
            },
            Count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: {
              ClassName: "$_id.ClassName",
              Section: "$_id.Section",
            },
            AttendanceDetails: {
              $push: {
                Status: "$_id.Status",
                Count: "$Count",
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id.ClassName",
            Sections: {
              $push: {
                Section: "$_id.Section",
                AttendanceDetails: "$AttendanceDetails",
              },
            },
          },
        },
        {
          $sort: { _id: 1 }, // Optional: Sort by ClassName alphabetically
        },
      ]);
    };

    const currentPeriodData = await aggregateAttendance(
      currentPeriodStart,
      currentPeriodEnd
    );

    res.json(currentPeriodData);
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    res.status(500).send("Server error while fetching attendance summary");
  }
};
