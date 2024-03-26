// Importing required modules
const Employee = require("../models/employeeModel");

// add member controller function with validation
const addMember = async (req, res) => {
    try {
        // Destructure request body
        const { firstName, lastName, email, contact, clearanceLevel, department } = req.body;

        // Check for required fields
        if (!firstName || !lastName || !email || !contact || !clearanceLevel || !department) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if email is already in use
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Validate contact format (assuming a simple phone number format)
        const contactRegex = /^\d{8}$/; // Assuming a 10-digit phone number
        if (!contactRegex.test(contact)) {
            return res.status(400).json({ message: "Invalid contact format. Please provide a 8 digit phone number" });
        }

        // Create employee document
        const employeeModel = await Employee.create({ firstName, lastName, email, contact, clearanceLevel, department });
        
        // Send success response
        res.json({ employeeModel });
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Export the controller function
module.exports = { addMember };
