#!/usr/bin/env bash
set -e 
GOOS=linux go build
docker build -t leemeli/wwimages .
go clean