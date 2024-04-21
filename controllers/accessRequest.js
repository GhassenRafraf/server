const Employee = require("../models/employeeModel");

const checkAccess = async (req, res) => {
  const { employeeId, employeeClearance, employeeLevel } = req.body;

  try {
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    } else {
      if (
        employee.clearanceLevel === parseInt(employeeClearance) &&
        employee.department === employeeLevel
      ) {
        return res.status(200).json({ message: "Grant Access" });
        
      } else {
        return res.status(403).json({ message: "Access Denied" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { checkAccess };

