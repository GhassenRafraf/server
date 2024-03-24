const Employee = require("../models/employeeModel");


//add member controller
const addMember = async (req, res) => {

    const { firstName, lastName, email, contact, clearanceLevel, department } = req.body;
    const employeeModel =   await Employee.create({ firstName, lastName, email, contact, clearanceLevel, department });
    res.json({employeeModel});

};

module.exports = { addMember };