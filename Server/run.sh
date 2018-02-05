#!/usr/bin/env bash
export TLSKEY=/tls/privkey.pem
export TLSCERT=/tls/fullchain.pem

docker rm -f wwgateway

docker run -d \
-p 443:443 \
--name wwgateway \
-e REDISADDR=localhost:6379 \
-e DBADDR=localhost:27017 \
-e TLSCERT=$TLSCERT \
-e TLSKEY=$TLSKEY \
leemeli/wwgateway