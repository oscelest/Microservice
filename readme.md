# Microservice project

This project includes a set of Node.js microservices that should be served in containers to create an example webshop:

- [Microservice Frontend](https://github.com/oscelest/microservice-frontend)
- [Microservice Inventory](https://github.com/oscelest/microservice-inventory)

## Commands to remember:

Start everything (in background and build it):

`docker-compose up -d --build`

Stop everything:

`docker-compose down`

Remove all untagged images:

`docker rmi $(docker images -q --filter "dangling=true")`

Remove all containers:

`docker rm $(docker ps -aq)`

Remove all images:

`docker rmi $(docker images -q)`

Remove everything:

`docker system prune`
