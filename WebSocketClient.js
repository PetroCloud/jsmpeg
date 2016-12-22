// ----------------------------------------------------------------------------
// Built-in WebSocket instance
// It should handle disconnection and any reconnection method + listening again
//
'use strict';

/**
 * WebSocketClient
 * @param jsmpeglive A jsmpeglive instance
 * @constructor
 */
var WebSocketClient = function WebSocketClient(jsmpeglive) {
  if (!jsmpeglive) {
    throw new Error('jsmpeglive has not been passed in to the constructor');
  }
  this.number = 0; // Message number
  this.attempts = 1; // reconnection attempts
  this.jsmpeglive = jsmpeglive;
  this.instance = null;
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
    self.attempts = 1;
    self.instance.binaryType = 'arraybuffer';
    self.instance.onmessage = function (event) {
      console.debug('onmessage');
      self.jsmpeglive.receiveData.bind(self.jsmpeglive, event.data)();
      self.number++;
      self.onmessage(event);
    };
    self.onopen();
  };

  this.instance.onclose = function (err) {
    switch (err.code) {
      case 1000: // CLOSE_NORMAL
        console.debug('WebSocket: closed');
        break;
      default: // Abnormal closure
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
  var self = this;
  var time = generateInterval(self.attempts);

  function generateInterval(k) {
    return Math.min(30, (Math.pow(2, k) - 1)) * 1000;
  }

  console.debug('WebSocketClient: retry in ' + time + 'ms', e);
  setTimeout(function () {
    self.attempts++;
    console.debug('WebSocketClient: reconnecting...' + self.attempts);
    self.connect(self.url);
  }, time);
};

WebSocketClient.prototype.onopen = function () {
  console.debug('WebSocketClient: open', arguments);
};

WebSocketClient.prototype.onerror = function (e) {
  console.debug('WebSocketClient: error', e);
};

WebSocketClient.prototype.onmessage = function (event) {
  console.debug('WebSocketClient: message', event.data.length);
};

WebSocketClient.prototype.onclose = function (err) {
  console.debug('WebSocketClient: closed', err.code);
};
