if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const connectToDb = require('./config/connectToDb');
const employeeControllers = require('./controllers/employeeControllers');

const app = express();

app.use(cors());
app.use(express.json());

connectToDb();

// Routes
app.post('/addMember', employeeControllers.addMember);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});