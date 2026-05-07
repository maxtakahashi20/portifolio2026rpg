FROM golang:1.23-alpine AS builder

WORKDIR /src

COPY cmd/api/go.mod ./
COPY cmd/api/go.sum ./

RUN go mod download

COPY cmd/api .

RUN go build -o app .

FROM alpine:3.19

WORKDIR /app

COPY --from=builder /src/app .

EXPOSE 8787

CMD ["./app"]