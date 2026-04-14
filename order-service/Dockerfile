FROM python:3.11-alpine

# Install curl for health check
RUN apk add --no-cache curl

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 5000
CMD ["python", "main.py"]