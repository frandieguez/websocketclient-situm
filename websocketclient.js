import Stomp from "webstomp-client";
import SockJS from "sockjs-client";

var socket = null;
var stompClient = null;

const printLine = (message) => {
  const inOut = document.createElement("TR");
  const messageObj = JSON.parse(message.body);
  const typeClass = messageObj.event_type === "in" ? "is-success" : "is-danger";
  const textNode = `
      <td>${messageObj.timestamp}</td>
      <td><span class="${typeClass}>${messageObj.event_type}</span></td>
      <td>${messageObj.geofence_id}</td>
      <td>${messageObj.building_id}</td>
      <td>${messageObj.device_id}</td>
    `;
  inOut.innerHTML = textNode;
  document.getElementById("in-out-notification-list").appendChild(inOut);
};

const connectionSuccess = () => {
  stompClient.subscribe("/user/queue/geofencing", printLine);
};

const connect = (jwt, domain) => {
  socket = new SockJS(domain + "/ws");
  stompClient = Stomp.over(socket);
  stompClient.connect({ Authorization: "Bearer " + jwt }, connectionSuccess);
};

const disconnectSuccess = () => {
  console.log(`${new Time()}: Disconect`);
};

const disconnect = () => {
  stompClient.disconnect(connectionSuccess, {});
};

export default { connect, disconnect };
