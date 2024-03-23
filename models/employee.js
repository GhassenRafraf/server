const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    contact: String,
    clearanceLevel: Number,
    department: String
});

const Employee = model('Employee', EmployeeSchema);

export default Employee;
