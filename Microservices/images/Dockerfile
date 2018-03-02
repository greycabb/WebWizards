FROM alpine
RUN apk add --no-cache ca-certificates
ADD images wwimages
COPY images.json images.json
ENTRYPOINT ["/wwimages"]
