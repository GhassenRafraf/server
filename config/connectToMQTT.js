const mqtt = require("mqtt");

function initializeMQTT() {
  const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL);

  mqttClient.on("connect", () => {
    console.log("Connected to MQTT broker");
    
  });

  mqttClient.on("error", (error) => {
    console.error("MQTT client error:", error);
  });

  mqttClient.on("offline", () => {
    console.log("MQTT client is offline");
  });


  return  mqttClient  ;
}

module.exports = { initializeMQTT };
