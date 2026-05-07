# API Go — deploy no Render (Web Service → Docker)
FROM golang:1.21-alpine AS builder

WORKDIR /src

# Copia dependências
COPY go.mod ./
COPY go.sum ./
RUN go mod download

# Copia código fonte
COPY . ./ 

# Compila o binário
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /api ./cmd/api

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /app

# Copia binário para a imagem final
COPY --from=builder /api ./api

ENV PORT=8787
EXPOSE 8787

# Permissões no binário
RUN chmod +x /api

CMD ["./api"]