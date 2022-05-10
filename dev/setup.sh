docker run -d --name psnidb -p 5433:5432 \
-v $(pwd)/data:/var/lib/postgresql/data \
-e POSTGRES_PASSWORD=password timescale/timescaledb:latest-pg12

#docker exec -it psnidb psql -U postgres
