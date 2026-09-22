# Storefront Upgrade Implementation Plan

> Execute inline using executing-plans; approved design is in ../specs/2026-09-22-storefront-design.md.

**Goal:** Improve discovery, presentation, useful content and search indexing for Nara Charm.
**Architecture:** Retain Next App Router and exported catalog JSON. Server-render content; isolate catalog controls in a client component and pure filtering utility. Keep product concepts outside production data.
**Tech Stack:** Next.js 16, React 19, Tailwind 4, TypeScript, Node test runner via tsx.

## Constraints
- Preserve existing product identities and live pricing/inventory.
- Do not publish invented product facts or functional-looking placeholder controls.
- Use existing image assets and no new dependencies.

## Tasks
- [x] Add behavioral regression tests for catalog search/filter/sorting, absolute product schema URLs and sitemap category coverage.
- [x] Implement `src/lib/catalog.ts`, `src/components/product-catalog.tsx`, `/shop` and shared SEO helper.
- [x] Replace home page with editorial shopping layout; refine global tokens/cards/navigation and PDP support information.
- [x] Add three practical articles and six private product concept drafts.
- [x] Correct metadata, sitemap, robots and product JSON-LD.
- [x] Run tests with `pnpm --filter web exec tsx --test tests/storefront.test.ts`, typecheck, ESLint and Next build. Inspect desktop and mobile routes and record limitations.
