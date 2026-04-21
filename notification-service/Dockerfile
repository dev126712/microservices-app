FROM golang:1.21-alpine

RUN apk add --no-cache curl

WORKDIR /app
COPY . .

# Add ENV GO111MODULE=off to build without a go.mod file
ENV GO111MODULE=off
RUN go build -o main .

EXPOSE 5001
CMD ["./main"]

