//load env variables
import * as dotenv from "dotenv";
if (process.env.NODE_ENV != "production") {
    dotenv.config();
  }

//import dependencies
import express, { json } from "express";
const cors = require("cors");
const connectToDb = require("./config/connectToDB");
const employeeController = require('./controllers/employeeController');

const app = express();
app.use(json());
app.use(cors());

connectToDb();

app.post("/employee", employeeController.createEmployee);


app.listen(process.env.PORT);