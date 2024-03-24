const Employee = require("../models/employeeModel");

const addMember = async (req, res) => {
    try{
    const { firstName, lastName, email, contact, clearanceLevel, department } = req.body;
    const employeeModel =   await Employee.create({ firstName, lastName, email, contact, clearanceLevel, department });
    res.json({employeeModel});

    res.status(201).json({ message: "Employee added successfully" });
    } catch (error) {
        res.status(400).json({ message: "Server error" });
    }
};

module.exports = { addMember };