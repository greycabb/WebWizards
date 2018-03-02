./build.sh
docker push leemeli/wwimages

ssh root@api.webwizards.me << EOF
docker rm -f wwimages
docker pull leemeli/wwimages
docker run -d \
--network appnet \
--name wwimages \
leemeli/wwimages
EOF