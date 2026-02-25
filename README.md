# docs-deploy

Documentation website for Shema Docs and RFC library. **How to contribute to each part of the docs is in this README** — see [How to contribute to the docs](#how-to-contribute-to-the-docs) below.

## How to contribute to the docs

Each part of the site has a clear place to edit and, when needed, a sidebar entry to add.

### Main documentation (Docs)

| Section | Where to edit | Sidebar |
|--------|----------------|--------|
| **Intro** | `site/docs/intro.md` | Already in `mainSidebar` |
| **Platform Overview** | `site/docs/overview/`, `site/docs/architecture/` | Add new file to the category in `site/sidebars.ts` |
| **Systems** | `site/docs/systems/*.md` | Add new system page to `Systems` or `Research and Models` in `site/sidebars.ts` |
| **Process** | `site/docs/process/*.md` | Add to `Process` in `site/sidebars.ts` |
| **Reference** | `site/docs/reference/*.md` | Add to `Reference` in `site/sidebars.ts` |

- Use **MDX** (`.mdx`) when you need components, callouts, or diagrams; otherwise `.md` is fine.
- When adding a **new doc**, create the file under the right folder and add its slug to `site/sidebars.ts` in the matching category.
- For new **system pages**, start from the templates in Reference → `site/docs/reference/documentation-templates.md`.
- Keep content factual and link to RFCs where relevant; see Process → `site/docs/process/content-governance.md` for standards.

### RFC Library

| What | Where | What to do |
|------|--------|------------|
| **RFC content** | `rfcs/NNN-slug.md` (e.g. `rfcs/012-new-feature.md`) | Create or edit the markdown file |
| **Main sidebar links** | `site/sidebars.ts` → "RFC Library (Creation Order)" | Add a `type: 'link'` with `href: '/rfcs/slug'` in the right subcategory |
| **RFC-sidebar TOC** | `site/sidebarsRfcs.ts` | Add a `doc` entry with `id` = filename without `NNN-` and `.md` (e.g. `012-new-feature.md` → id `new-feature`) |

- Use the **NNN-slug** naming and the lifecycle in Process → `site/docs/process/rfc-workflow.md`.
- Required sections: Context, Problem statement, Options considered, Chosen direction, Consequences and risks, Rollout plan.

### Site and theme

| Area | Where to edit |
|------|----------------|
| **Homepage** | `site/src/pages/index.tsx`, `site/src/pages/index.module.css` |
| **Global theme / navbar / footer** | `site/src/css/custom.css`, `site/docusaurus.config.ts` |
| **Main docs sidebar order** | `site/sidebars.ts` |
| **RFC sidebar order** | `site/sidebarsRfcs.ts` |

Changes here affect the whole site; run locally with Docker Compose to verify before pushing.

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
