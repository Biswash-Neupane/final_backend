const StudentModel = require("../models/StudentModel");

exports.getAttendanceSummary = async (req, res) => {
  let { startDate, endDate } = req.query;
  const currentDate = new Date().toISOString().split("T")[0]; // Format current date as YYYY-MM-DD

  if (!startDate || !endDate) {
    startDate = currentDate;
    endDate = currentDate;
  }

  const currentPeriodStart = new Date(startDate);
  const currentPeriodEnd = new Date(endDate);
  const duration =
    (currentPeriodEnd - currentPeriodStart) / (1000 * 60 * 60 * 24);

  const previousPeriodEnd = new Date(
    currentPeriodStart.getTime() - 24 * 60 * 60 * 1000
  );
  const previousPeriodStart = new Date(
    previousPeriodEnd.getTime() - duration * 24 * 60 * 60 * 1000
  );

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

    const currentPeriodData = await aggregateAttendance(
      currentPeriodStart,
      currentPeriodEnd
    );
    const previousPeriodData = await aggregateAttendance(
      previousPeriodStart,
      previousPeriodEnd
    );

    const formatAttendanceData = (data) => {
      let formattedData = { present: 0, absent: 0, onLeave: 0 };
      data.forEach((item) => {
        if (item._id === "present") formattedData.present = item.count;
        else if (item._id === "absent") formattedData.absent = item.count;
        else if (item._id === "on leave") formattedData.onLeave = item.count;
      });
      return formattedData;
    };

    const formattedCurrentPeriodData = formatAttendanceData(currentPeriodData);
    const formattedPreviousPeriodData =
      formatAttendanceData(previousPeriodData);

    // Calculate offsets
    const calculateOffset = (current, previous) => {
      if (previous === 0) return "N/A"; // Handle division by zero
      return `${(((current - previous) / previous) * 100).toFixed(2)}%`;
    };

    const response = {
      present: formattedCurrentPeriodData.present,
      absent: formattedCurrentPeriodData.absent,
      onLeave: formattedCurrentPeriodData.onLeave,
      presentOffset: calculateOffset(
        formattedCurrentPeriodData.present,
        formattedPreviousPeriodData.present
      ),
      absentOffset: calculateOffset(
        formattedCurrentPeriodData.absent,
        formattedPreviousPeriodData.absent
      ),
      onLeaveOffset: calculateOffset(
        formattedCurrentPeriodData.onLeave,
        formattedPreviousPeriodData.onLeave
      ),
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    res.status(500).send("Server error while fetching attendance summary");
  }
};
