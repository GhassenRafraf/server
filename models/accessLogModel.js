const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const accessLogSchema = new Schema({
  employeeId: {
    type: String,
    required: true
  },
  accessGranted: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const AccessLog = mongoose.model("AccessLog", accessLogSchema);

module.exports = AccessLog;
