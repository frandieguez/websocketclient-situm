import Stomp from "webstomp-client";
import SockJS from "sockjs-client";

export default class WebSocketClient {
  socket = null;
  stompClient = null;
  debug = false;
  server = null;
  jwt = null;
  signals = null;
  channelName = null;
  channelSubscription = null;

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
    this.debug && console.log(`Connection stablished`);
    this.signals.onConnected(params);

    this.channelSubscription = this.stompClient.subscribe(
      this.channelName,
      this.signals.onMessageReceived
    );
  };

  connect = () => {
    this.socket = new SockJS(this.server + "/ws", {
      debug: this.debug,
    });
    this.stompClient = Stomp.over(this.socket, {
      debug: this.debug,
    });
    this.stompClient.connect(
      { Authorization: "Bearer " + this.jwt },
      this.connectionSuccess,
      this.signals.onError
    );

    this.debug && console.log("Connection: ", { object: this });
  };

  disconnect = () => {
    this.stompClient.unsubscribe(this.channelSubscription);
    this.stompClient.disconnect(this.signals.onDisconnected, {});
  };
}
