if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const connectToDb = require("./config/connectToDb");
const employeeControllers = require("./controllers/employeeControllers");
const request = require("./controllers/accessRequest");
const diagnostic = require("./controllers/diagnostic");
const { initializeMQTT } = require("./config/connectToMQTT");
const http = require("http");
const MQTT_TOPICS = [
  "$SYS/broker/clients/active",
  "$SYS/broker/clients/maximum",
];
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

connectToDb();

const mqttClient = initializeMQTT();
let latestMessageObject = {};

employeeControllers.setMQTTClient(mqttClient);
diagnostic.MQTTClient(mqttClient);
diagnostic.getIpAddress();
mqttClient.subscribe(MQTT_TOPICS, (error) => {
  if (error) {
    console.error("Error subscribing to topic:", error);
  } else {
    mqttClient.on("message", (topic, message) => {
      if (
        topic === "$SYS/broker/clients/active" ||
        topic === "$SYS/broker/clients/maximum"
      ) {
        const value = parseInt(message.toString());
        latestMessageObject[topic] = value;
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ topic: topic, message: value }));
          }
        });
      }
    });
  }
});
wss.on("connection", (ws) => {
  Object.entries(latestMessageObject).forEach(([topic, value]) => {
    ws.send(JSON.stringify({ topic: topic, message: value }));
  });
});

wss.on("error", (error) => {
  console.error("WebSocket server error:", error);
});

// Routes
app.post("/addMember", employeeControllers.addMember);
app.delete("/removeMember/:id", employeeControllers.removeMember);
app.get("/fetchMembers", employeeControllers.fetchMembers);
app.put("/updateMember/:id", employeeControllers.updateMember);
app.post("/requestAccess", request.checkAccess);
app.get("/fetchLogs", request.fetchLogs);
app.get("/countLogsByDay", request.countLogsByDay);
app.post("/pingIPs", diagnostic.pingIPs);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
