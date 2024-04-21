const Employee = require("../models/employeeModel");
const AccessLog = require("../models/accessLogModel");

const checkAccess = async (req, res) => {
  const { employeeId, employeeClearance, employeeLevel } = req.body;

  try {
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    } else {
      let accessGranted = false;
      
      if (
        employee.clearanceLevel === parseInt(employeeClearance) &&
        employee.department === employeeLevel
      ) {
        accessGranted = true;
      }

      if (accessGranted) {
        await AccessLog.create({
          employeeId: employeeId,
          accessGranted: accessGranted,
        });
      }

      if (accessGranted) {
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
