# desilist-backend

# Setting up environments instructions
Clone the project to github develop branch

```bash
git clone -b https://github.com/greenskytech/desilist-backend.git .
```

# Setting up environments containers (Linux distro)
Copy the .env.example content in a file named env.development.local, this procedure has to be done in each service folder

```bash
cp .env.example env.development.local
```
```bash
cp chats-services/.env.example chats-services/env.development.local
```
```bash
cp services/notifications/.env.example services/notifications/chats-services/env.development.local
```
```bash
cp services/zipcodes/.env.example services/zipcodes/chats-services/env.development.local
```


Start containers

```bash
    docker-compose -f docker-compose-local.yml up -d --build
```

Stops container

```bash
    docker-compose -f docker-compose-local.yml down --remove-orphans
```
Access container by terminal

```bash
    docker exec -it container-name sh
```
View the last 20 lines in logs container with time stamp

```bash
    docker logs --tail=20 -t container-name 
```
 Run pm2 monit 

 ```bash
    docker exec -it service-container-name pm2 monit
```
To delete resources not used by docker can execute
 ```bash
    docker system prune
```
This command will delete all resources that are not being used

To run a frontend you have to fill the environment variable FRONTEND_PATH with your local frontend path 
