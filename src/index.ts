import WebsocketClient from "./lib/WebSocketClient";

let ws = null;
let geofences = null;

const onConnected = (params) => {
  console.log("Connected", params);
};
const onDisconnected = (params) => {
  console.log("Disconnected", params);
  disconnect();
};

const onMessageReceived = (message) => {
  console.log(message);
  const inOut = document.createElement("TR");
  const messageObj = JSON.parse(message.body);
  const typeClass = messageObj.event_type === "in" ? "is-success" : "is-danger";
  const textNode = `
        <td>${messageObj.timestamp}</td>
        <td><span class="${typeClass}">${messageObj.event_type}</span></td>
        <td>${messageObj.geofence_id}</td>
        <td>${messageObj.building_id}</td>
        <td>${messageObj.device_id}</td>
      `;
  inOut.innerHTML = textNode;

  document.getElementById("in-out-notification-list").prepend(inOut);
};

const connect = async () => {
  const jwt = document.getElementById("jwtInput").value;
  const server = document.getElementById("domainInput").value;

  geofences = await fetch(`${server}/api/v1/geofences`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + jwt,
    },
  });
  console.log(geofences);
  ws = new WebsocketClient({
    jwt,
    server,
    onConnected,
    onMessageReceived,
    onDisconnected,
  }).connect();

  document.getElementById("disconnectBtn").classList.remove("is-hidden");
  document.getElementById("connectBtn").classList.add("is-hidden");
};

const disconnect = () => {
  ws && ws.disconnect();

  document.getElementById("disconnectBtn").classList.add("is-hidden");
  document.getElementById("connectBtn").classList.remove("is-hidden");
};

document.addEventListener("DOMContentLoaded", (event) => {
  // try {
  //   for (let index = 0; index < 100; index++) {
  //     onMessageReceived({
  //       body: '{"geofence_id":"17c34c8b-7958-42d0-846c-6bce15d6c03f","building_id":"6950","device_id":"253939250359797","event_type":"Out","timestamp":"2021-11-16T00:42:31+02:00"}',
  //     });
  //   }
  // } catch (error) {
  //   console.error(error);
  // }

  // Register events
  document.getElementById("connectBtn").onclick = connect;
  document.getElementById("disconnectBtn").onclick = disconnect;
});
