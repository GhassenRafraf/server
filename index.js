import  Express  from "express";
import mysql from "mysql";
import cors from "cors";

const app = Express();
app.use(Express.json());
app.use(cors());

app.listen(3030, () => {
    console.log("Server is running on port 3030");    
})