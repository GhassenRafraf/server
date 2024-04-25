if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const connectToDb = require("./config/connectToDb");
const employeeControllers = require("./controllers/employeeControllers");
const request = require("./controllers/accessRequest");
const { initializeMQTT } = require("./config/connectToMQTT");
const http = require("http");
const MQTT_TOPIC = "test";
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

connectToDb();

// Initialize MQTT connection
const mqttClient = initializeMQTT();
employeeControllers.setMQTTClient(mqttClient);

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const decodedMessage = message.toString('utf-8');
    console.log("Received message from client:", decodedMessage);  });
    
  ws.send("Welcome! You are now connected to the WebSocket server.");
});

// Update latestData and broadcast to WebSocket clients when a new MQTT message is received
mqttClient.on("message", function (topic, message) {
  console.log("Received message from MQTT:", message.toString());
  const newMessage = message.toString();

  if (latestData !== newMessage) {
    latestData = newMessage;
    
    // Send message to all WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ data: latestData }));
      }
    });
  }
});

// Handle WebSocket connection errors
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

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});