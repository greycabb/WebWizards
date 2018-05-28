
# temporarily stop your Docker container
ssh root@webwizards.me << EOF

docker stop wwclient
letsencrypt renew
docker start wwclient

EOF