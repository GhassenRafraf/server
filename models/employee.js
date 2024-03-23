const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    contact: String,
    clearanceLevel: Number,
    department: String
});

const employee = mongoose.model('employee', employeeSchema);

module.exports = employee;
