FROM golang:1.21-alpine AS builder

WORKDIR /src

# Copia dependências do diretório cmd/api
COPY cmd/api/go.mod ./
COPY cmd/api/go.sum ./
RUN go mod download

# Copia o código da aplicação
COPY cmd/api/ ./

# Compila o binário
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /api ./main.go

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /app

# Copia o binário para a imagem final
COPY --from=builder /api ./api

ENV PORT=8787
EXPOSE 8787

RUN chmod +x /api

CMD ["./api"]