"use strict";var WebSocketClient=function(){EventEmitter.call(this),this.number=0,this.attempts=1,this.instance=null};WebSocketClient.prototype=Object.create(EventEmitter.prototype),WebSocketClient.prototype.constructor=WebSocketClient,WebSocketClient.prototype.close=function(){this.instance&&this.instance.close&&(this.instance.close(),this.instance.onopen=null,this.instance.onmessage=null,this.instance.onclose=null,this.instance.onerror=null,this.instance=null)},WebSocketClient.prototype.connect=function(e){var t=this;this.url=e,this.instance=new WebSocket(this.url),this.instance.onopen=function(){t.attempts=1,t.instance.binaryType="arraybuffer",t.instance.onmessage=function(e){console.debug("onmessage",t),t.emit("data",e.data),t.number++,t.onmessage(e)},t.onopen()},this.instance.onclose=function(e){switch(e.code){case 1e3:console.debug("WebSocket: closed");break;default:t.reconnect.bind(t)(e)}t.onclose(e)},this.instance.onerror=function(e){switch(e.code){case"ECONNREFUSED":t.reconnect.bind(t)(e);break;default:t.onerror(e)}}},WebSocketClient.prototype.send=function(e){try{this.instance.send(e)}catch(e){this.instance.emit("error",e)}},WebSocketClient.prototype.reconnect=function(e){function t(e){return 1e3*Math.min(30,Math.pow(2,e)-1)}var n=this,o=t(n.attempts);console.debug("WebSocketClient: retry in "+o+"ms",e),setTimeout(function(){n.attempts++,console.debug("WebSocketClient: reconnecting..."+n.attempts),n.connect(n.url)},o)},WebSocketClient.prototype.onopen=function(){console.debug("WebSocketClient: open",arguments)},WebSocketClient.prototype.onerror=function(e){console.debug("WebSocketClient: error",e)},WebSocketClient.prototype.onmessage=function(e){console.debug("WebSocketClient: message",e.data.length)},WebSocketClient.prototype.onclose=function(e){console.debug("WebSocketClient: closed",e.code)};