FROM alpine
RUN apk add --no-cache ca-certificates
ADD htmlblocks wwhtml
COPY htmldata.json htmldata.json
COPY cssattributes.json cssattributes.json
COPY cssgroupdata.json cssgroupdata.json
ENTRYPOINT ["/wwhtml"]
