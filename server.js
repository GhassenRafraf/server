if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const connectToDb = require("./config/connectToDb");
const employeeControllers = require("./controllers/employeeControllers");
const {initializeMQTT} = require("./config/connectToMQTT");
const http = require("http");
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

connectToDb();
// Initialize MQTT connection
const mqttClient = initializeMQTT();
employeeControllers.setMQTTClient(mqttClient);



// Routes
app.post("/addMember", employeeControllers.addMember);
app.delete("/removeMember/:id", employeeControllers.removeMember);
app.get("/fetchMembers", employeeControllers.fetchMembers);
app.put("/updateMember/:id", employeeControllers.updateMember);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
