#!/usr/bin/env bash
./build.sh

docker run -d \
-p 80:80 \
--name wwcss \
leemeli/wwcss