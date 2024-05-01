const ping = require('ping');

let ipAddresses = [];

let mqttClient;
function MQTTClient(client) {
  mqttClient = client;
}

const getIpAddress = () => {
    mqttClient.subscribe("raspberry/ip", (error) => {
        if (error) {
            console.error("Error subscribing to topic:", error);
        } else {
            mqttClient.on("message", (topic, message) => {
                if (topic === "raspberry/ip") {
                    const value = message.toString();
                    ipAddresses.push(value);
                    console.log("IP Address:", value);
                }
            });
        }
    });
};

const pingIPs = async (req, res) => {
    const responsiveIPs = new Set();
    const nonResponsiveIPs = new Set();
    const processedIPs = new Set(); 

    const pingAddress = async (ipAddress) => {
        try {
            if (!processedIPs.has(ipAddress)) {
                const result = await ping.promise.probe(ipAddress);
                if (result.alive) {
                    responsiveIPs.add(ipAddress);
                } else {
                    nonResponsiveIPs.add(ipAddress);
                }
                processedIPs.add(ipAddress); 
            }
        } catch (error) {
            console.error("Error pinging IP address:", ipAddress, error);
            nonResponsiveIPs.add(ipAddress);
            processedIPs.add(ipAddress); 
        }
    };

    await Promise.all(ipAddresses.map(pingAddress));

    return res.status(200).json({
        responsiveIPs: Array.from(responsiveIPs), 
        nonResponsiveIPs: Array.from(nonResponsiveIPs) 
    });
};


module.exports = { MQTTClient, getIpAddress, pingIPs };
