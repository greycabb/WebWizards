
# temporarily stop your Docker container
ssh root@api.webwizards.me << EOF

docker stop wwgateway
letsencrypt renew
docker start wwgateway

EOF