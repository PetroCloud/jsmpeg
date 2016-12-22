// ----------------------------------------------------------------------------
// Built-in WebSocket instance
// It should handle disconnection and any reconnection method + listening again
//
'use strict';

var WebSocketClient = function (jsmpeglive) {
  if (!jsmpeglive) {
    throw new Error('jsmpeglive has not been passed in to the constructor');
  }
  this.number = 0;    // Message number
  this.autoReconnectInterval = 5 * 1000;    // ms
  this.jsmpeglive = jsmpeglive;
  this.instance = null;
  this.state = 'stopped';
};

WebSocketClient.prototype.close = function () {
  if (this.instance && this.instance.close) {
    this.instance.close();
    this.instance.onopen = null;
    this.instance.onmessage = null;
    this.instance.onclose = null;
    this.instance.onerror = null;
    this.instance = null;
  }
};

WebSocketClient.prototype.connect = function (url) {

  var self = this;
  this.url = url;
  this.instance = new WebSocket(this.url);

  this.instance.onopen = function () {
    self.instance.binaryType = 'arraybuffer';
    self.instance.onmessage = function (event) {
      self.jsmpeglive.receiveData.bind(self.jsmpeglive, event.data)();
      self.number++;
      self.onmessage(event);
    };
    self.onopen();
  };

  this.instance.onclose = function (err) {
    switch (err.code) {
      case 1000:  // CLOSE_NORMAL
        console.log("WebSocket: closed");
        break;
      default:    // Abnormal closure
        self.reconnect.bind(self)(err);
        break;
    }
    self.onclose(err);
  };

  this.instance.onerror = function (err) {
    switch (err.code) {
      case 'ECONNREFUSED':
        self.reconnect.bind(self)(err);
        break;
      default:
        self.onerror(err);
        break;
    }
  };
};

WebSocketClient.prototype.send = function (data) {
  try {
    this.instance.send(data);
  } catch (e) {
    this.instance.emit('error', e);
  }
};

WebSocketClient.prototype.reconnect = function (e) {
  console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`, e);
  var that = this;
  setTimeout(function () {
    console.log("WebSocketClient: reconnecting...");
    that.connect(that.url);
  }, this.autoReconnectInterval);
};

WebSocketClient.prototype.onopen = function () {
  console.log("WebSocketClient: open", arguments);
};

WebSocketClient.prototype.onerror = function (e) {
  console.log("WebSocketClient: error", arguments);
};

WebSocketClient.prototype.onmessage = function (event) {
  console.log("WebSocketClient: message");
};

WebSocketClient.prototype.onclose = function (e) {
  console.log("WebSocketClient: closed", arguments);
};