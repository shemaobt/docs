# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Preferred local workflow

Use Docker Compose from the repository root:

```bash
docker compose up
```

The full local workflow and RFC volume mapping are documented in `../README.md`.

## Optional direct Node.js workflow

```bash
npm ci
npm run start
```

For production build checks:

```bash
npm run build
```
