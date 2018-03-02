export TLSCERT=/etc/letsencrypt/live/webwizards.me/fullchain.pem
export TLSKEY=/etc/letsencrypt/live/webwizards.me/privkey.pem

./build.sh
docker rm -f wwclient
docker push leemeli/wwclient

ssh root@webwizards.me << EOF
docker rm -f wwclient
docker pull leemeli/wwclient
docker run -d \
-p 443:443 \
-p 80:80 \
--name wwclient \
-v /etc/letsencrypt:/etc/letsencrypt:ro \
-e TLSCERT=$TLSCERT \
-e TLSKEY=$TLSKEY \
leemeli/wwclient
EOF