const mongoose = require('mongoose');

async function connectToDb() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to database');
  } catch (error) {
    console.log('Error connecting to database', error);
  }
}
module.exports = connectToDb;