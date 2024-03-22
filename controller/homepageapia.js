const SchoolModel = require("../models/schoolModel"); // Adjust the path as necessary

exports.getSchoolInfo = async (req, res) => {
  try {
    // Assuming there's only one school document in the collection
    const schoolInfo = await SchoolModel.findOne(
      {},
      "SchoolName SchoolID TotalStudents TotalStaffs"
    );
    if (!schoolInfo) {
      return res.status(404).send({ message: "School information not found" });
    }
    // Directly send the school information as an object
    res.send({
      SchoolName: schoolInfo.SchoolName,
      SchoolID: schoolInfo.SchoolID,
      TotalStudents: schoolInfo.TotalStudents,
      TotalStaffs: schoolInfo.TotalStaffs,
    });
  } catch (error) {
    res
      .status(500)
      .send({
        message: "Error retrieving school information",
        error: error.message,
      });
  }
};
