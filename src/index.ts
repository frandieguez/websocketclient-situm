import WebsocketClient from "./lib/WebSocketClient";

class Page {
  ws = null;
  debug = false;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }

  registerUICallbacks() {
    document.getElementById("connectBtn").onclick = this.connect;
    document.getElementById("disconnectBtn").onclick = this.disconnect;
  }

  onConnected = (params) => console.log("Connected", params);
  onSubscribed = (params) => console.log("Subscribed", params);
  onDisconnected = (params) => console.log("Disconnected", params);
  onError = (error) => error.type == "close" && this.onDisconnected(error);

  onMessageReceived = (message) => {
    const inOut = document.createElement("TR");
    const messageObj = JSON.parse(message.body);
    const typeClass =
      messageObj.event_type === "In" ? "is-success" : "is-danger";
    const textNode = `
          <td>${messageObj.timestamp}</td>
          <td><span class="${typeClass}">${messageObj.event_type}</span></td>
          <td>${messageObj.geofence_id}</td>
          <td>${messageObj.building_id}</td>
          <td>${messageObj.device_id}</td>
        `;
    inOut.innerHTML = textNode;

    document.getElementById("in-out-notification-list").prepend(inOut);

    console.log("Message received", messageObj);
  };

  connect = function () {
    try {
      document.getElementById("disconnectBtn").classList.remove("is-hidden");
      document.getElementById("connectBtn").classList.add("is-hidden");

      // Fetch data
      const jwt = (<HTMLInputElement>document.getElementById("jwtInput")).value;
      const server = (<HTMLInputElement>document.getElementById("domainInput"))
        .value;
      this.debug = (<HTMLInputElement>(
        document.getElementById("debugInput")
      )).checked;

      if (!jwt || !server) {
        alert("Please provide a jwt and a server to fetch info from");
        return;
      }

      // geofences = fetch(`${server}/api/v1/geofences`, {
      //   method: "GET",
      //   headers: new Headers({
      //     "Content-Type": "application/json",
      //     Authorization: "Bearer " + jwt,
      //   }),
      // }).then((data) => {
      //   console.log(data);
      //   try {
      //     for (let index = 0; index < 100; index++) {
      //       onMessageReceived({
      //         body: '{"geofence_id":"17c34c8b-7958-42d0-846c-6bce15d6c03f","building_id":"6950","device_id":"253939250359797","event_type":"In","timestamp":"2021-11-16T00:42:31+02:00"}',
      //       });
      //     }
      //   } catch (error) {
      //     console.error(error);
      //   }
      // });

      // Start WS client
      this.ws = new WebsocketClient({
        onConnected: this.onConnected,
        onChannelSubscribe: this.onSubscribed,
        onMessageReceived: this.onMessageReceived,
        onDisconnected: this.onDisconnected,
        onError: this.onError,
        debug: this.debug,
      });

      this.ws.connect({
        jwt,
        server,
        channelName: "/user/queue/geofencing",
      });
    } catch (error) {
      this.disconnect();
    }
  };

  disconnect = function () {
    this.ws.disconnect();

    document.getElementById("disconnectBtn").classList.add("is-hidden");
    document.getElementById("connectBtn").classList.remove("is-hidden");
  };
}

document.addEventListener("DOMContentLoaded", (event) => {
  new Page().registerUICallbacks();
});
