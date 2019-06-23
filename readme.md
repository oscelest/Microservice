# Microservice project

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
