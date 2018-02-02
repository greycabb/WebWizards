#!/usr/bin/env bash
export TLSKEY=/tls/privkey.pem
export TLSCERT=/tls/fullchain.pem

docker rm -f gateway

docker run -d \
-p 443:443 \
--name wwgateway \
-e TLSCERT=$TLSCERT \
-e TLSKEY=$TLSKEY \
leemeli/wwgateway