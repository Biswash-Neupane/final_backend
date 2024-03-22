require("dotenv").config({
  path: "C:/Users/NYT/OneDrive/Desktop/Codebase_1/try_1/.env",
});

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const ClassModel = require("./models/ClassModel.js"); // Adjust this path if needed
const NepaliDate = require("nepali-date-converter");

// Controllers - Import your controllers
const homepageapi = require("./controller/homepageapia.js");
const attendanceController = require("./controller/homepageapib.js");
const homeChartData = require("./controller/homepageapic.js");
const lineGraphData = require("./controller/homepageapid.js");
const studentSearchController = require("./controller/studentsearchapi.js");
const getStudentAttendanceByNameController = require("./controller/getParticularStudentAttendanceapi.js");
const holidaysController = require("./controller/holidaysController.js"); // Update the path accordingly
const holidaysControllerb = require("./controller/postHolidaysapi.js");
const {
  getAttendanceRecords,
} = require("./controller/getClassSectionAttendenceAPI.js");
const {
  appendAttendanceRecords,
} = require("./controller/ManualAttendanceAPI.js");

const app = express();
const port = process.env.PORT || 80; // Adjust if different port is needed

app.use(cors());
app.use(express.json());

// MongoDB connection setup
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas..."))
  .catch((err) => console.error("Could not connect to MongoDB Atlas...", err));

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.path}`);
  if (Object.keys(req.body).length !== 0) {
    console.log("Request Body:", req.body);
  }
  next();
});

// Function to handle attendance updates (from app.js)
app.post("/test", async (req, res) => {
  let { StudentID, Date: receivedDate, Time } = req.body;

  const dateParts = receivedDate.split("-");
  const gregorianDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const nepaliDate = new NepaliDate(gregorianDate);
  const convertedDate = `${nepaliDate.getYear()}-${
    nepaliDate.getMonth() + 1
  }-${nepaliDate.getDate()}`;

  receivedDate = convertedDate;

  if (
    typeof StudentID === "string" &&
    typeof receivedDate === "string" &&
    typeof Time === "string"
  ) {
    try {
      const result = await ClassModel.findOne({
        $or: [
          { "Sections.A.StudentID": StudentID },
          { "Sections.B.StudentID": StudentID },
        ],
      });

      if (!result) {
        return res.send("Failed");
      }

      const sectionKey = result.Sections.A.some(
        (student) => student.StudentID === StudentID
      )
        ? "A"
        : "B";
      const studentObj = result.Sections[sectionKey].find(
        (student) => student.StudentID === StudentID
      );

      if (
        studentObj.Attendance.some((record) => record.date === receivedDate)
      ) {
        return res.send("Already Done");
      }

      await ClassModel.updateOne(
        { [`Sections.${sectionKey}.StudentID`]: StudentID },
        {
          $push: {
            [`Sections.${sectionKey}.$.Attendance`]: {
              date: receivedDate,
              time: Time,
              status: "present",
            },
          },
        }
      );

      res.send(studentObj.StudentName);
    } catch (error) {
      console.error("Error updating attendance:", error);
      res.send("Failed");
    }
  } else {
    res.send("Invalid Input");
  }
});

// Existing routes from server.js
app.get("/api/home/data1", homepageapi.getSchoolInfo);
app.get("/api/home/data2", attendanceController.getAttendanceSummary);
app.get("/api/attendance/summary", homeChartData.homechartdata);
app.get("/api/home/linegraph/:type", lineGraphData.linegraphdata);
app.get(
  "/api/search/students/:searchString",
  studentSearchController.searchStudentsByNameOrClass
);
app.get(
  "/api/attendance/:studentName",
  getStudentAttendanceByNameController.getStudentAttendanceByName
);
app.get("/api/school/holidays", holidaysController.getHolidays);
app.post("/api/school/mark-holiday", holidaysControllerb.markHoliday);
app.post("/api/Student-Report-Class", getAttendanceRecords);
app.post("/api/append-attendance", appendAttendanceRecords);

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}...`));
