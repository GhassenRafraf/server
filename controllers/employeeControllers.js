// Importing required modules
const Employee = require("../models/employeeModel");
const { detectLandmarks } = require("../landmarking/landmarks");
const multer = require("multer");

let mqttClient;
function setMQTTClient(client) {
  mqttClient = client;
}


// Multer configuration

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage }).single('image');

// add member controller function
const addMember = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, error: "File upload error" });
      } else if (err) {
        return res.status(500).json({ success: false, error: "Internal server error" });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, error: "No image uploaded" });
      }

      const { firstName, lastName, email, contact, clearanceLevel, department } = req.body;

      if (!firstName || !lastName || !email || !contact || !clearanceLevel || !department) {
        return res.status(400).json({ success: false, error: "All fields are required" });
      }

      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        return res.status(400).json({ success: false, error: "Email already exists" });
      }

      const contactRegex = /^\d{8}$/;
      if (!contactRegex.test(contact)) {
        return res.status(400).json({
          success: false,
          error: "Invalid contact format. Please provide an 8 digit phone number",
        });
      }

      const addedAt = new Date();

      detectLandmarks(req.file.path, async (error, landmarks) => {
        if (error) {
          return res.status(500).json({ success: false, error: "Failed to detect landmarks" });
        }

        try {
          const employeeModel = await Employee.create({
            firstName,
            lastName,
            email,
            contact,
            clearanceLevel,
            department,
            addedAt,
            landmarks: landmarks 
          });

          const topic = "employeeData"; 
          const payload = JSON.stringify({
            employeeId: employeeModel._id, 
            landmarks: landmarks 
          });
          mqttClient.publish(topic, payload,{ qos : 2},  (err) => {
            if (error) {
              return res.status(500).json({ success: false, error: "Failed to publish to MQTT" });
            }
          });

          return res.status(200).json({ success: true, message: "Member added successfully", employeeModel });
        } catch (error) {
          return res.status(500).json({ success: false, error: "Internal server error" });
        }
      });
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
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
    employee.clearanceLevel = -1;
    employee.deletedAt = new Date();
    await employee.save();
    res.status(200).json({ message: "Member deleted successfully", employee });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//fetch all members controller function
const fetchMembers = async (req, res) => {
  const department = req.query.department;
  let query = { clearanceLevel: { $ne: -1 } };

  if (department) {
    query.department = department;
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
  setMQTTClient,
};
