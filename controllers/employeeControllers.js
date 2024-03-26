// Importing required modules
const Employee = require("../models/employeeModel");

// add member controller function
const addMember = async (req, res) => {
    try {
        const { firstName, lastName, email, contact, clearanceLevel, department } = req.body;

        if (!firstName || !lastName || !email || !contact || !clearanceLevel || !department) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const contactRegex = /^\d{8}$/; 
        if (!contactRegex.test(contact)) {
            return res.status(400).json({ message: "Invalid contact format. Please provide an 8 digit phone number" });
        }

        const employeeModel = await Employee.create({ firstName, lastName, email, contact, clearanceLevel, department });
        
        return res.status(200).json({ message: "Member added successfully", employeeModel });
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// remove member controller function
const removeMember = async (req, res) => {
    const employeeId = req.params.id;
    await Employee.findByIdAndDelete(employeeId);
    res.status(200).json({ message: "Member deleted successfully" });
}

//fetch all members controller function
const fetchMembers = async (req, res) => {
    const employees = await Employee.find({});
    res.status(200).json({ employees });
}
//update member controller function
const updateMember = async (req, res) => {
    const employeeId = req.params.id;
    const {clearanceLevel} = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
    }
    employee.clearanceLevel = clearanceLevel;
    await employee.save();
    res.status(200).json({ message: "Employee updated successfully", employee });
}

// Export the controller function
module.exports = { 
    addMember,
    removeMember,
    fetchMembers,
    updateMember,
};
