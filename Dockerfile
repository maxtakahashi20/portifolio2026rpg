# API Go — deploy no Render (Web Service → Docker)
FROM golang:1.21-alpine AS builder
WORKDIR /src
COPY go.mod ./
COPY cmd/api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /api ./cmd/api

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /api ./api
# Render define PORT automaticamente; local fallback em main.go
ENV PORT=8787
EXPOSE 8787
CMD ["./api"]
