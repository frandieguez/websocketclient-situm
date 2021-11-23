import WebsocketClient from "./lib/WebSocketClient";
import jwtDecode from "jwt-decode";

function decimalToHexString(number) {
  if (number < 0) {
    number = 0xffffffff + number + 1;
  }

  return number.toString(16).toUpperCase();
}

class Page {
  ws = null;
  debug = false;
  geofences = [];

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
    const { geofence_id, building_id, device_id, timestamp, event_type } =
      messageObj;
    const typeClass = event_type === "In" ? "is-success" : "is-danger";
    const geofenceName =
      this.geofences.find((it) => it.id == geofence_id)?.name || geofence_id; //this.geofences.find();

    const textNode = `
          <td>${timestamp}</td>
          <td><span class="${typeClass}">${event_type}</span></td>
          <td title="${geofence_id}" data-geofence-id="${geofence_id}">${geofenceName}</td>
          <td>${building_id}</td>
          <td data-device-id-hex="${decimalToHexString(
            16
          )}" title="Hex: ${decimalToHexString(device_id)}">${device_id}</td>
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

      let jwtDecoded = jwtDecode(jwt) as {
        organization_uuid: string;
      };

      fetch(
        `${server}/api/v1/geofences/search?` +
          new URLSearchParams({
            organization_id: jwtDecoded.organization_uuid,
          }),
        {
          method: "GET",
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: "Bearer " + jwt,
          }),
        }
      ).then(async (data: any) => {
        let geofences = await data.json();
        this.geofences = geofences.data;
        console.log("Received list of geofences", { geofences });
        // try {
        //   for (let index = 0; index < 100; index++) {
        //     this.onMessageReceived({
        //       body: '{"geofence_id":"0e15cef8-c121-431a-8536-4b9638fbd449","building_id":"6950","device_id":"253939250359797","event_type":"In","timestamp":"2021-11-16T00:42:31+02:00"}',
        //     });
        //   }
        // } catch (error) {
        //   console.error(error);
        // }
      });

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
