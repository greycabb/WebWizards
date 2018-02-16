export TLSCERT=/etc/letsencrypt/live/api.webwizards.me/fullchain.pem
export TLSKEY=/etc/letsencrypt/live/api.webwizards.me/privkey.pem

./build.sh
docker push leemeli/wwgateway

ssh root@api.webwizards.me << EOF
docker rm -f wwgateway 
docker pull leemeli/wwgateway 
docker run -d \
--network appnet \
-e REDISADDR=redissvr:6379 \
-e DBADDR=mymongo:27017 \
-e SESSIONKEY='secretpassword1234!@melody' \
-e HTMLSVCADDR=wwhtml \
-p 443:443 \
--name wwgateway \
-v /etc/letsencrypt:/etc/letsencrypt:ro \
-e TLSCERT=$TLSCERT \
-e TLSKEY=$TLSKEY \
leemeli/wwgateway
EOF