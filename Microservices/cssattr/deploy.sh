./build.sh
docker push leemeli/wwcss

ssh root@api.webwizards.me << EOF
docker rm -f wwcss
docker pull leemeli/wwcss
docker run -d \
--network appnet \
--name wwcss \
leemeli/wwcss
EOF