# Stage 1: Build the binary
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o notification-app main.go

# Stage 2: Final lightweight image
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/notification-app .
EXPOSE 5001
CMD ["./notification-app"]
