const mqtt = require("mqtt");

// Function to initialize MQTT connection
function initializeMQTT() {
  const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL);
  mqttClient.on("connect", () => {
    console.log("Connected to MQTT broker");
  });
  return mqttClient;
}

module.exports = {initializeMQTT};