docker rmi -f $(docker images -q)
docker tag server:latest server:previous
docker-compose up -d --build