# Simple API with Swagger

This repository contains a minimal Node.js Express API with two endpoints and Swagger documentation.

## Endpoints

- `GET /` - health check or welcome message
- `POST /data` - accepts JSON payload from device

### POST payload example

```json
{
  "device_id": "esp32-01",
  "timestamp": 1625151600,
  "Temperatura": 24.5,
  "Umidade": 60.2
}
```

## Swagger docs

Swagger UI is available at `http://localhost:3000/api-docs` after starting the server.

## Running

```bash
npm install
npm start
```