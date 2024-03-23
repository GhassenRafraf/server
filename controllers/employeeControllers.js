const Employee  = require('../models/Employee');

    const createEmployee = async (req, res) => {
        const { firstName, lastName, email, contact, clearanceLevel, department } = req.body;
      
        const employee = Employee.create({
            firstName,
            lastName,
            email,
            contact,
            clearanceLevel,
            department
        });
      
        res.json({ Employee });
      };
export default {
    createEmployee
};