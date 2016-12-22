# jsmpeglive

#### An MPEG1 Video Decoder in JavaScript ####

jsmpeglive is a MPEG1 Live Video Decoder, written in JavaScript. 

It receives a live stream, via WebSocket. 

It is prepared to use any other Transport method available. It just needs to 
follow the same interface as the included built-in 
[WebSocketClient](./WebSocketClient.js).

This WebSocketClient has the logic to reconnect every 5 seconds

> TODO: add some logarithmic/fibonacci/exponential back-off method

## Setup

Run `npm install` and then `npm start` to start the HTTP and WebSockets server.

In an other terminal, 
Then, to start streaming, you can use a camera that provides a RTSP feed, or 
your own laptop

```bash
# Laptop Web cam feed
./start_ffmpeg_stream.sh /dev/video0
```

or

```bash
# Camera Feed
./start_ffmpeg_stream.sh "rtsp://192.168.1.54:554/axis-media/media.amp?videocodec=h264&resolution=640x480"
```

## API ##

### Constructor ###

`var player = new jsmpeglive(uri[, options])`

The `uri` argument accepts a WebSocket address for streaming playback.

The `options` argument to `jsmpeglive()` supports the following properties:

- `benchmark` whether to log benchmark results to the browser's console
- `canvas` the HTML Canvas element to use; jsmpeglive will create its own 
Canvas element if none is provided
- `ondecodeframe` a function that's called after every frame that's decoded 
and rendered to the canvas

### Examples ###

The best example is just checking the source code. Feel free to review 
[stream-example.html](./stream-example.html).

Note that you have to include both [WebSocketClient](./WebSocketClient.js) and 
[jsmpeglive](./jsmpeglive.js)  

```javascript
var player = new jsmpeglive('ws://localhost:8084/', {canvas:canvas});
```

## Diferences between `jsmpeglive` and `jsmpeg`
The Transport layer was removed from the main jsmpeg decoding object.
Also, as I didn't need recording, it was removed, as well as all the
functions for playing local video files.

## Limitations ##
- Only raw MPEG video streams are supported. The decoder hates Stream Packet 
Headers in between macroblocks.

You can use [FFmpeg](http://www.ffmpeg.org/) to encode videos in a suited 
format. Check [start_ffmpeg_stream,sh](./start_ffmpeg_stream.sh), it has the 
parameters needed to crop the size to a multiple of 2, omit B-Frames and force 
a raw video stream.

## Inspiration ##

It is based on the work of Dominic Szablewski's [jsmpeg](https://github.com/phoboslab/jsmpeg)

jsmpeg is based on [Java MPEG-1 Video Decoder and Player](http://sourceforge.net/projects/javampeg1video/) by Korandi Zoltan and inspired by [MPEG Decoder in Java ME](http://www.developer.nokia.com/Community/Wiki/MPEG_decoder_in_Java_ME) by Nokia.
