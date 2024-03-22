const mongoose = require("mongoose");
const express = require("express");
const ClassModel = require("./models/ClassModel"); // Ensure this path is correct
const NepaliDate = require("nepali-date-converter"); // Add this line to use the Nepali date converter

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// MongoDB URI - Placeholder, replace with your actual URI
const dbURI =
  "mongodb+srv://biswashneupane0:BULIGXjt10BwwoF1@newcluster.fertn8x.mongodb.net/datasheet";

// Connect to MongoDB
mongoose
  .connect(dbURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Function to handle attendance updates
app.post("/test", async (req, res) => {
  let { StudentID, Date: receivedDate, Time } = req.body; // Renamed Date to receivedDate to avoid conflict

  // Convert receivedDate to Nepali Date before doing anything
  const dateParts = receivedDate.split("-"); // Assuming receivedDate is in 'YYYY-MM-DD' format
  const gregorianDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); // Months are 0-indexed in JavaScript Date
  const nepaliDate = new NepaliDate(gregorianDate);
  const convertedDate = `${nepaliDate.getYear()}-${
    nepaliDate.getMonth() + 1
  }-${nepaliDate.getDate()}`; // Adjust month for 1-indexed format

  // Use convertedDate for all subsequent operations
  receivedDate = convertedDate;

  if (
    typeof StudentID === "string" &&
    typeof receivedDate === "string" && // Use the corrected variable name
    typeof Time === "string"
  ) {
    try {
      // Attempt to find the student
      const result = await ClassModel.findOne({
        $or: [
          { "Sections.A.StudentID": StudentID },
          { "Sections.B.StudentID": StudentID },
        ],
      });

      if (!result) {
        return res.send("Failed");
      }

      // Identify the section and student
      const sectionKey = result.Sections.A.some(
        (student) => student.StudentID === StudentID
      )
        ? "A"
        : "B";
      const studentObj = result.Sections[sectionKey].find(
        (student) => student.StudentID === StudentID
      );

      // Check if the date already exists
      if (
        studentObj.Attendance.some((record) => record.date === receivedDate)
      ) {
        return res.send("   Already Done"); // Send response if date exists
      }

      // If date does not exist, append the attendance
      await ClassModel.updateOne(
        { [`Sections.${sectionKey}.StudentID`]: StudentID },
        {
          $push: {
            [`Sections.${sectionKey}.$.Attendance`]: {
              date: receivedDate, // This will now append the Nepali date
              time: Time,
              status: "present",
            },
          },
        }
      );

      res.send(studentObj.StudentName); // Send student name as response
    } catch (error) {
      console.error("Error updating attendance:", error);
      res.send("Failed");
    }
  } else {
    res.send("Invalid Input");
  }
});

const port = 80; // Define a port to listen on
app.listen(port, () => console.log(`Server listening on port ${port}`));
