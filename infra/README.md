# Infrastructure for WebGIS
[Setting up the Infrastructure](#setup)<br>
[Starting and Tear down the Entire Infrastructure](#starting)<br>
[Resetting the Entire Infrastructure](#reset)<br>
## Setting up the Infrastructure <a name="setup"></a>
The `infra.sh` script can be used to initialize the infrastructure for the first time. The below command can be run once for setting up database and GIS systems. The command also brings up the entire infrastructure and make it ready to be used for development.
```
./infra.sh setup # For one-time setup
```
## Starting and Tear down the Entire Infrastructure <a name="starting"></a>
The `infra.sh` script provide a convenient way bring up or down the infrastructure using the commands below:
```
./infra.sh up   # For brinding UP the infrastructure
./infra.sh down # For brinding DOWN the infrastructure
```

The script starts the following services and administrative UIs listed in the following sections. <br>
<b>Note:</b> <ins>All services and administrative UIs can be accessed on the host machine using `localhost`</ins>

### Services
| Port | Services |
| ---- | ---- |
| 8080 | GeoServer |
| 5432 | PostgreSQL | 
| 6379 | Redis |
| 5672 | RabiitMQ |
| 51515 | Artifactory |
| 3001 | Streamer API |
| - | Streamer subscriber |
| 1337 | Streamer websocket

### Administrative UI
The administrative UI of different services are running on the following ports
| Port | Service |
| ---- | ------- |
| 8080 | GeoServer |
| 8081 | PostgreSQL (pgadmin) |
| 8082 | Redis |
| 8083 | RabbitMQ |

## Resetting the Entire Infrastructure <a name="reset"></a>
In some case, we might want to reset the entire infrastructure by cleaning all the data created by the containers. This completely delete all data of all services. The user should be mindful to use this command. The user will also need root privilege.
```
./infra.sh reset # Completely remove all data
```