import Stomp from "webstomp-client";
import SockJS from "sockjs-client";

export default class WebSocketClient {
  socket = null;
  stompClient = null;
  debug = null;
  server = null;
  jwt = null;
  signals = null;

  constructor({
    debug = false,
    server,
    jwt,
    onChannelSubscribe = (params) => {},
    onMessageReceived = (params) => {},
    onConnected = (params) => {},
    onDisconnected = (params) => {},
  }) {
    this.socket = null;
    this.stompClient = null;

    this.debug = debug;
    this.server = server;
    this.jwt = jwt;
    this.signals = {
      onChannelSubscribe,
      onMessageReceived,
      onConnected,
      onDisconnected,
    };
  }

  connectionSuccess = (params) => {
    console.log(`Connection stablished`);
    this.signals.onConnected(params);

    this.stompClient.subscribe(
      "/user/queue/geofencing",
      this.signals.onMessageReceived
    );
  };

  connect = () => {
    this.socket = new SockJS(this.server + "/ws", {
      debug: this.debug,
    });
    this.stompClient = Stomp.over(this.socket);
    this.stompClient.connect(
      { Authorization: "Bearer " + this.jwt },
      this.connectionSuccess
    );
    console.log({ object: this });
  };

  disconnect = () => {
    this.stompClient.disconnect(this.signals.onDisconnected, {});
  };
}
