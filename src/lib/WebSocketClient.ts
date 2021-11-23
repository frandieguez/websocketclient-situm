import Stomp from "webstomp-client";
import SockJS from "sockjs-client";

export default class WebSocketClient {
  socket = null;
  stompClient = null;
  debug = false;
  signals = null;
  channelSubscription = null;

  constructor({
    debug = false,
    onChannelSubscribe = (params) => {},
    onMessageReceived = (params) => {},
    onConnected = (params) => {},
    onDisconnected = (params) => {},
    onError = (params) => {},
  }) {
    this.socket = null;
    this.stompClient = null;

    this.debug = debug;
    this.signals = {
      onChannelSubscribe,
      onMessageReceived,
      onConnected,
      onDisconnected,
      onError,
    };
  }

  connectionSuccess = ({ server, jwt, channelName }) => {
    this.signals.onConnected({ server, jwt });

    this.channelSubscription = this.stompClient.subscribe(
      channelName,
      this.signals.onMessageReceived
    );

    this.signals.onChannelSubscribe({ channelName });
  };

  connect = ({ channelName, server, jwt }) => {
    this.socket = new SockJS(server + "/ws", {
      debug: this.debug,
    });
    this.stompClient = Stomp.over(this.socket, {
      debug: this.debug,
    });
    this.stompClient.connect(
      { Authorization: "Bearer " + jwt },
      () => this.connectionSuccess({ server, jwt, channelName }),
      this.signals.onError
    );
  };

  disconnect = () => {
    this.stompClient.unsubscribe(this.channelSubscription);
    this.stompClient.disconnect(this.signals.onDisconnected, {});
  };
}
