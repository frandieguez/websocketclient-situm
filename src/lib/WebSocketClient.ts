import Stomp from "webstomp-client";
import SockJS from "sockjs-client";

export default class WebSocketClient {
  socket = null;
  stompClient = null;
  debug = null;
  server = null;
  jwt = null;
  signals = null;
  channelNane = null;

  constructor({
    debug = false,
    channelName,
    server,
    jwt,
    onChannelSubscribe = (params) => {},
    onMessageReceived = (params) => {},
    onConnected = (params) => {},
    onDisconnected = (params) => {},
    onError = (params) => {},
  }) {
    this.socket = null;
    this.stompClient = null;

    this.debug = debug;
    this.server = server;
    this.jwt = jwt;
    this.channelName = channelName;
    this.signals = {
      onChannelSubscribe,
      onMessageReceived,
      onConnected,
      onDisconnected,
      onError,
    };
  }

  connectionSuccess = (params) => {
    console.log(`Connection stablished`);
    this.signals.onConnected(params);

    this.stompClient.subscribe(
      this.channelName,
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
      this.connectionSuccess,
      this.signals.onError
    );
    console.log({ object: this });
  };

  disconnect = () => {
    this.stompClient.disconnect(this.signals.onDisconnected, {});
  };
}
