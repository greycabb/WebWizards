./build.sh
docker push leemeli/wwhtml

ssh root@api.webwizards.me << EOF
docker rm -f wwhtml
docker pull leemeli/wwhtml
docker run -d \
--network appnet \
--name wwhtml \
leemeli/wwhtml
EOF