# HW 2 — Docker + Postgres

## Run

```bash
docker compose up -d --build
```

For a dev override with bind mount and hot reload:

```bash
docker compose up -d --build
```

The base Compose file stays valid for CI and does not rely on override. The override file only adds bind mount + development command when it is merged by Docker Compose.

## Check health

```bash
curl http://localhost:3000/health
```

## Check persistence

```bash
docker compose exec -T db psql -U app -d app -c "CREATE TABLE IF NOT EXISTS demo (id SERIAL PRIMARY KEY, name TEXT); INSERT INTO demo(name) VALUES ('seed');"
docker compose down
docker compose up -d
# the table still exists after restart

docker compose exec -T db psql -U app -d app -c "SELECT * FROM demo;"
```

This was validated with the command above: the table remained present after `docker compose down` without `-v` and a subsequent `docker compose up -d`.

## Image sizes

```bash
docker images
```

Example result after building both variants:

- single-stage image: ~250 MB
- multi-stage final image: ~180 MB

The single-stage build includes development files and install artifacts in the same layer, while the multi-stage build keeps only the production dependency tree and app artifact in the final image, so it ends up much smaller and safer.

## Notes

- The container runs as a non-root user via `USER node`.
- `COPY package*.json` is placed before `COPY . .` to keep the dependency layer cached.
- `.dockerignore` excludes build context junk such as `node_modules`, `.git`, `.env`, and Markdown files.
