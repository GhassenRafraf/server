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
        await Employee.findByIdAndUpdate(employeeId, { onSite: true });
        await AccessLog.create({
          employeeId: employeeId,
          accessGranted: accessGranted,
          firstName: employee.firstName,
          lastName: employee.lastName,
          department: employee.department,
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
const fetchLogs = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await AccessLog.find({ timestamp: { $gte: today } }).sort({
      timestamp: -1,
    });

    return res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const countLogsByDay = async (req, res) => {
  try {
    const logs = await AccessLog.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1,
          "_id.day": -1,
        },
      },
    ]);

    return res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = { checkAccess, fetchLogs, countLogsByDay };
