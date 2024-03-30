// Importing required modules
const Employee = require("../models/employeeModel");

// add member controller function
const addMember = async (req, res) => {
  try {
    const { firstName, lastName, email, contact, clearanceLevel, department } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !contact ||
      !clearanceLevel ||
      !department
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const contactRegex = /^\d{8}$/;
    if (!contactRegex.test(contact)) {
      return res.status(400).json({
        message:
          "Invalid contact format. Please provide an 8 digit phone number",
      });
    }

    const addedAt = new Date();

    // Create the employee
    const employeeModel = await Employee.create({
      firstName,
      lastName,
      email,
      contact,
      clearanceLevel,
      department,
      addedAt,
    });

    return res
      .status(200)
      .json({ message: "Member added successfully", employeeModel });
  } catch (error) {
     return res.status(500).json({ message: "Internal server error" });
  }
};

// remove member controller function
const removeMember = async (req, res) => {
  const employeeId = req.params.id;

  try {
    // Fetch the employee document by ID
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update the clearance level to -1
    employee.clearanceLevel = -1;

    // Add timestamp for deletion
    employee.deletedAt = new Date().toLocaleDateString;

    // Save the updated document
    await employee.save();

    res.status(200).json({ message: "Member deleted successfully", employee });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//fetch all members controller function
const fetchMembers = async (req, res) => {
    const department = req.query.department; // Get department from query parameters
    let query = { clearanceLevel: { $ne: -1 } }; // Exclude deleted employees by default
  
    if (department) {
      query.department = department; // If department is specified, filter by department
    }
  
    try {
      const employees = await Employee.find(query);
      res.status(200).json({ employees });
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

//update member controller function
const updateMember = async (req, res) => {
  const employeeId = req.params.id;
  const { clearanceLevel } = req.body;
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }
  employee.clearanceLevel = clearanceLevel;
  await employee.save();
  res.status(200).json({ message: "Employee updated successfully", employee });
};


// Export the controller function
module.exports = {
  addMember,
  removeMember,
  fetchMembers,
  updateMember,

};
