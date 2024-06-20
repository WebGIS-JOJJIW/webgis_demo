# Infrastructure for WebGIS
## Starting the Entire Infrastructure
Running docker compose with the command below on this directory (`infra`) start the entire infrastructure.
```
docker compose up -d
```

## Administrative UI
The administrative UI of different services are running on the following ports
| Port | Service |
| ---- | ------- |
| 8080 | GeoServer |
| 8081 | PostgreSQL (pgadmin) |
| 8082 | Redis |
| 8083 | RabbitMQ |