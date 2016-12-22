#!/usr/bin/env bash

ffmpeg -i $1 -y -vf "crop=iw-mod(iw\,2):ih-mod(ih\,2)" -b 0 -f mpeg1video http://localhost:8082/640/480/

