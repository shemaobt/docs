# docs-deploy

Documentation website for Shema Docs and RFC library.

## Local run with Docker Compose

This setup runs Docusaurus locally and mounts:

- `./site` as the local docs app,
- `./rfcs` as local RFC content.

### Start

```bash
docker compose up
```

Open: `http://localhost:3000`

### Stop

```bash
docker compose down
```

### Reinstall dependencies in container

```bash
docker compose down -v
docker compose up
```

## Notes

- RFC markdown files are managed directly in `docs-deploy/rfcs`.
- The local run uses `DOCS_BASE_URL=/` to mimic runtime behind a root path for easier review before deployment.
