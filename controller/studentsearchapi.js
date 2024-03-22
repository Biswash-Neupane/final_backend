const ClassModel = require("../models/ClassModel"); // Ensure this path matches your file structure

// Function to determine the type of search based on input
const isNumericSearch = (input) => /^\d+$/.test(input); // Checks if the input is purely numerical

// Controller function with post-processing for sorting by relevance
exports.searchStudentsByNameOrClass = async (req, res) => {
  const searchString = req.params.searchString;
  const searchPattern = new RegExp(searchString, "i"); // Case-insensitive

  try {
    if (isNumericSearch(searchString)) {
      // Numeric search - looking for classes
      const classes = await ClassModel.find(
        {
          ClassName: { $regex: searchPattern },
        },
        "ClassName Sections.A Sections.B -_id"
      ).lean();

      const result = classes.map((cls) => ({
        ClassName: cls.ClassName,
        Sections: Object.keys(cls.Sections).map((section) => section),
      }));

      res.json(result);
    } else {
      // Alphabetical search - looking for student names
      const students = await ClassModel.find(
        {
          $or: [
            { "Sections.A.StudentName": { $regex: searchPattern } },
            { "Sections.B.StudentName": { $regex: searchPattern } },
          ],
        },
        {
          "Sections.A.StudentName": 1,
          "Sections.B.StudentName": 1,
          _id: 0,
        }
      ).lean();

      let studentNames = [];
      students.forEach((cls) => {
        ["A", "B"].forEach((section) => {
          if (cls.Sections[section]) {
            cls.Sections[section].forEach((student) => {
              studentNames.push(student.StudentName);
            });
          }
        });
      });

      // Remove duplicates
      studentNames = [...new Set(studentNames)];

      // Sort by relevance - exact matches first, then by how early the search string appears
      studentNames
        .sort((a, b) => {
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          const searchLower = searchString.toLowerCase();
          if (aLower === searchLower) return -1;
          if (bLower === searchLower) return 1;
          let comparison =
            aLower.indexOf(searchLower) - bLower.indexOf(searchLower);
          if (comparison === 0) {
            return aLower.localeCompare(bLower);
          }
          return comparison;
        })
        .reverse(); // Reverse the array to make most relevant results appear at the top

      res.json(studentNames);
    }
  } catch (error) {
    console.error("Error in search operation:", error);
    res.status(500).send("Error in search operation");
  }
};
